import { useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { streamChat, type ChatHistoryMessage } from '../api/chatStream';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// Only the last few turns are sent back as context — enough for follow-up questions
// without the history growing unbounded (and costing more tokens) over a long session.
const MAX_HISTORY_TURNS = 10;

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'seed', role: 'assistant', text: "Hi! Ask me anything about your properties, leases, rent, or invoices." },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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

    const appendToAssistant = (delta: string) => {
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
        style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 50 }}
        className="h-14 w-14 items-center justify-center rounded-full bg-slate-900 shadow-lg"
      >
        <Text style={{ fontSize: 24 }}>💬</Text>
      </Pressable>
    );
  }

  return (
    <View
      style={{ position: 'absolute', bottom: 24, right: 24, width: 340, height: 460, zIndex: 50 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
    >
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3">
        <Text className="text-base font-semibold text-white">Ask about your portfolio</Text>
        <Pressable onPress={() => setOpen(false)} hitSlop={8}>
          <Text className="text-lg text-white">✕</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-slate-50 px-3 py-3"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{ maxWidth: '80%' }}
            className={`mb-2 rounded-2xl px-3 py-2 ${
              message.role === 'user' ? 'self-end bg-slate-900' : 'self-start bg-slate-200'
            }`}
          >
            {message.role === 'assistant' && message.text === '' && sending ? (
              <ActivityIndicator size="small" color="#475569" />
            ) : (
              <Text className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-slate-800'}`}>{message.text}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
        <TextInput
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm"
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
          className={`rounded-full px-4 py-2 ${sending || !draft.trim() ? 'bg-slate-300' : 'bg-slate-900'}`}
        >
          <Text className="text-sm font-semibold text-white">Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
