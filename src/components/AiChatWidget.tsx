import { useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const CANNED_REPLY = "Thanks for your message! (This is a placeholder assistant — no real AI is connected yet.)";

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'seed', role: 'assistant', text: "Hi! I'm Claude, your assistant. How can I help today?" },
  ]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: 'assistant', text: CANNED_REPLY }]);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
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
        <Text className="text-base font-semibold text-white">Claude</Text>
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
            <Text className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-slate-800'}`}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
        <TextInput
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm"
          placeholder="Message Claude…"
          placeholderTextColor="#94a3b8"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable onPress={handleSend} className="rounded-full bg-slate-900 px-4 py-2">
          <Text className="text-sm font-semibold text-white">Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
