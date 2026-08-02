"use client";

import { useEffect, useRef, useState } from "react";
import { getMessages } from "../../services/api";
import ChatBubble from "./ChatBubble";
import PromptBox from "./PromptBox";
import TypingIndicator from "./TypingIndicator";

import { sendMessage } from "@/services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatWindowProps = {
  selectedChat: number;
};

export default function ChatWindow({
  selectedChat,
}: ChatWindowProps) {
  console.log("Current Chat:",selectedChat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {

  async function loadMessages() {

    const data = await getMessages(selectedChat);

    setMessages(data);

  }

  loadMessages();

}, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function handleSend(message: string) {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updated = [...messages, userMessage];

    setMessages(updated);
    setThinking(true);

    try {
      const response = await sendMessage(selectedChat,message);

      setThinking(false);

      setMessages([
        ...updated,
        {
          role: "assistant",
          content: response.reply,
        },
      ]);
    } catch {
      setThinking(false);

      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "❌ Unable to contact Nexus AI.",
        },
      ]);
    }
  }

  return (
    <div className="mt-12 flex h-[650px] flex-col rounded-3xl border border-white/10 bg-[#111118] shadow-[0_0_35px_rgba(0,255,255,0.03)]">
      <div className="flex-1 overflow-y-auto scroll-smooth p-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-zinc-500 text-lg">
            ✨Start a conversation with Nexus AI...
          </div>
        )}
        
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            role={msg.role}
            content={msg.content}
          />
        ))}

        {thinking && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      <PromptBox onSend={handleSend} />
    </div>
  );
}