import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { streamChat, type ChatHistoryMessage } from '../api/chatStream';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// Only the last few turns are sent back as context — enough for follow-up questions
// without the history growing unbounded (and costing more tokens) over a long session.
const MAX_HISTORY_TURNS = 10;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_SIZE = { width: Math.min(480, SCREEN_WIDTH * 0.92), height: Math.min(720, SCREEN_HEIGHT * 0.85) };
const EXPANDED_MARGIN = 32;

// Matches the compact bottom bar in Sidebar (icon tile + label + padding).
const TAB_BAR_HEIGHT = 62;

export default function AiChatWidget() {
  // On a phone the tab bar sits along the bottom, so the floating buttons have to
  // clear it. On a tablet the bar is a side rail and nothing moves.
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { height: windowHeight } = useWindowDimensions();
  const compact = useCompactLayout();
  const bottomOffset = compact ? TAB_BAR_HEIGHT + insets.bottom + 16 : 24;

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'seed', role: 'assistant', text: "Hi! Ask me anything about your properties, leases, rent, or invoices." },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // The panel shrinks when the keyboard opens, so the newest message would end up
  // scrolled out of view.
  useEffect(() => {
    if (keyboardHeight > 0) scrollRef.current?.scrollToEnd({ animated: true });
  }, [keyboardHeight]);

  // Stop any speech in progress if the panel closes or voice mode gets turned off.
  useEffect(() => {
    if (!open || !voiceEnabled) Speech.stop();
  }, [open, voiceEnabled]);

  const speak = (text: string) => {
    Speech.speak(text, {
      onError: (error) => console.warn('[AiChatWidget] Speech.speak failed:', error),
    });
  };

  const handleToggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      // Immediate, short confirmation so voice mode is testable without waiting on a
      // full reply — if this isn't audible, it's the device/emulator's audio output,
      // not the chat (check the emulator isn't muted at the host level, and that a
      // TTS voice is installed under Android Settings > Accessibility > Text-to-speech).
      if (next) speak('Voice replies are on.');
      return next;
    });
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    const history: ChatHistoryMessage[] = messages
      .filter((m) => m.id !== 'seed')
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.text }));

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text };
    const assistantId = `${Date.now()}-assistant`;
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: 'assistant', text: '' }]);
    setDraft('');
    setSending(true);

    let fullReply = '';
    const appendToAssistant = (delta: string) => {
      fullReply += delta;
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)));
      scrollRef.current?.scrollToEnd({ animated: true });
    };

    try {
      await streamChat({
        message: text,
        history,
        onText: appendToAssistant,
        onError: (message) => appendToAssistant(`\n\n⚠️ ${message}`),
      });
      if (voiceEnabled && fullReply.trim()) {
        speak(fullReply);
      }
    } catch {
      appendToAssistant("\n\n⚠️ Couldn't reach the assistant — check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={{ position: 'absolute', bottom: bottomOffset, right: 24, zIndex: 50 }}
        className="h-14 w-14 items-center justify-center rounded-full bg-slate-900 shadow-lg"
      >
        <Text style={{ fontSize: 24 }}>💬</Text>
      </Pressable>
    );
  }

  // On a phone the chat takes the whole screen and its input row sits flush on top
  // of the keyboard, the way every messaging app behaves. A floating card that
  // shrank around the keyboard was the wrong shape at this width.
  const sheetStyle = {
    position: 'absolute' as const,
    top: insets.top,
    left: 0,
    right: 0,
    bottom: keyboardHeight,
    zIndex: 50,
  };

  const floatingStyle = expanded
    ? {
        position: 'absolute' as const,
        top: EXPANDED_MARGIN + insets.top,
        left: EXPANDED_MARGIN,
        right: EXPANDED_MARGIN,
        bottom: EXPANDED_MARGIN + keyboardHeight,
        zIndex: 50,
      }
    : {
        position: 'absolute' as const,
        bottom: bottomOffset + keyboardHeight,
        right: 24,
        width: PANEL_SIZE.width,
        height: Math.min(
          PANEL_SIZE.height,
          windowHeight - keyboardHeight - bottomOffset - insets.top - 16,
        ),
        zIndex: 50,
      };

  const panelStyle = compact ? sheetStyle : floatingStyle;

  return (
    <View
      style={panelStyle}
      className={`overflow-hidden bg-white shadow-lg ${
        compact ? '' : 'rounded-2xl border border-slate-200'
      }`}
    >
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3">
        <Text className="text-base font-semibold text-white">Ask about your portfolio</Text>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={handleToggleVoice} hitSlop={8}>
            <Text style={{ fontSize: 18 }}>{voiceEnabled ? '🔊' : '🔇'}</Text>
          </Pressable>
          <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8} disabled={compact} style={{ display: compact ? 'none' : 'flex' }}>
            <Text style={{ fontSize: 16 }} className="text-white">
              {expanded ? '⤡' : '⤢'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setOpen(false)} hitSlop={8}>
            <Text className="text-lg text-white">✕</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-slate-50 px-4 py-4"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{ maxWidth: '85%' }}
            className={`mb-3 rounded-2xl px-4 py-3 ${
              message.role === 'user' ? 'self-end bg-slate-900' : 'self-start bg-slate-200'
            }`}
          >
            {message.role === 'assistant' && message.text === '' && sending ? (
              <ActivityIndicator size="small" color="#475569" />
            ) : (
              <Text className={`text-base leading-6 ${message.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                {message.text}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View
        style={{ paddingBottom: compact && keyboardHeight === 0 ? insets.bottom + 12 : 12 }}
        className="flex-row items-center gap-2 border-t border-slate-200 bg-white px-4 pt-3"
      >
        <TextInput
          className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-base"
          placeholder="e.g. Which leases expire this year?"
          placeholderTextColor="#94a3b8"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!sending}
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || !draft.trim()}
          className={`rounded-full px-5 py-3 ${sending || !draft.trim() ? 'bg-slate-300' : 'bg-slate-900'}`}
        >
          <Text className="text-base font-semibold text-white">Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
