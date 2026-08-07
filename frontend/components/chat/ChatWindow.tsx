"use client";

import { useEffect, useRef, useState } from "react";

import {
  getMessages,
  streamMessage,
  renameChat,
} from "../../services/api";

import ChatBubble from "./ChatBubble";
import PromptBox from "./PromptBox";
import TypingIndicator from "./TypingIndicator";

type Message = {
  role: "user" | "assistant";
  content: string;
};
type Chat = {
  id: number;
  title: string;
};
type ChatWindowProps = {
  selectedChat: number;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
};

export default function ChatWindow({
  selectedChat,
  chats,
  setChats,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat whenever selected chat changes
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages(selectedChat);
        setMessages(data);
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    }

    loadMessages();
  }, [selectedChat]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function handleSend(message: string) {
    console.log("handleSend started");
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updated = [...messages, userMessage];

    setMessages(updated);
    setThinking(true);

    try {
      let streamedReply = "";

      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "",
        },
      ]);
      console.log("Calling streamMessage...");
      await streamMessage(
        selectedChat,
        message,
        (chunk) => {
          streamedReply += chunk;

          setMessages([
            ...updated,
            {
             role: "assistant",
             content: streamedReply,
            },
          ]);
        }
      );
      setThinking(false);

      // Rename brand new chats
      if (messages.length === 0) {
        const title =
          message.length > 40
            ? message.substring(0, 40) + "..."
            : message;

        await renameChat(
          selectedChat,
          title
        );
        const updatedChats = chats.map((chat) =>
          chat.id === selectedChat
            ? { ...chat, title }
            : chat
        );

        setChats(updatedChats);
      }
      
    } catch(err) {
      console.error("HANDLE SEND ERROR:",err);
      console.error(err);
      setThinking(false);

      setMessages([
        ...updated,
        {
          role: "assistant",
          content:
            "❌ Unable to contact Nexus AI.",
        },
      ]);
    }
  }

  return (
    <div className="mt-12 flex h-[650px] flex-col rounded-3xl border border-white/10 bg-[#111118] shadow-[0_0_35px_rgba(0,255,255,0.03)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-zinc-500 text-lg">
            ✨ Start a conversation with Nexus AI...
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