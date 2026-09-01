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
  mode?: string | null;
};

export default function ChatWindow({
  selectedChat,
  chats,
  setChats,
  mode,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [activeFilename, setActiveFilename] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipNextScrollRef = useRef(false);

  // Load chat whenever selected chat changes
  useEffect(() => {
    setActiveFilename(null);

    async function loadMessages() {
      try {
        const data = await getMessages(selectedChat);
        // Prevent auto-scroll when loading an existing chat
        skipNextScrollRef.current = true;

        setMessages(data);
      } catch (err) {
        console.error(err);

        skipNextScrollRef.current = true;
        setMessages([]);
      }
    }

    loadMessages();
  }, [selectedChat]);

  // Auto scroll
  useEffect(() => {
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function handleStop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setThinking(false);
  }

  async function handleSend(message: string, filename?: string) {
    console.log("handleSend started");
    if (filename) {
      setActiveFilename(filename);
    }
    const effectiveFilename = filename || activeFilename;

    let effectiveMessage = message.trim();

    if (!effectiveMessage && filename) {
      if (mode === "analyze") {
        effectiveMessage =
          "Analyze the attached file and explain the key insights, important information, and anything I should pay attention to.";
      } else if (mode === "code") {
        effectiveMessage =
          "Analyze the attached code, explain what it does, identify problems, and suggest improvements.";
      } else if (mode === "research") {
        effectiveMessage =
          "Analyze the attached material and provide a detailed explanation of the important findings and information.";
      } else if (mode === "create") {
        effectiveMessage =
          "Use the attached file as context and help me create something useful from it.";
      } else {
        effectiveMessage =
          "Analyze the attached file and explain the important information.";
      }
    }

    if (!effectiveMessage) return;
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = {
      role: "user",
      content: effectiveMessage,
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
        effectiveMessage,
        (chunk) => {
          streamedReply += chunk;

          setMessages([
            ...updated,
            {
             role: "assistant",
             content: streamedReply,
            },
          ]);
        },
        controller.signal,
        effectiveFilename || undefined
      );
      abortControllerRef.current = null
      setThinking(false);

      // Rename brand new chats
      if (messages.length === 0) {
        const title =
          effectiveMessage.length > 40
            ? effectiveMessage.substring(0, 40) + "..."
            : effectiveMessage;

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
      if ((err as Error).name === "AbortError") {
        console.log("Generation stopped by user.");
        setThinking(false);
        return;
      }
      console.error(err);
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
    <div className="flex h-full min-h-0 flex-col rounded-3xl border border-white/10 bg-[#111118] shadow-[0_0_35px_rgba(0,255,255,0.03)]">
      {mode && (
        <div className="border-b border-white/10 px-6 py-4">
          <div className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            {mode} mode
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {mode === "analyze" &&
              "Upload a file, paste text, or describe something you want Nexus to analyze."}

            {mode === "code" &&
              "Paste code or describe what you want Nexus to build, debug, or improve."}

            {mode === "research" &&
              "Enter a topic and Nexus will help you explore it in detail."}

            {mode === "create" &&
              "Describe what you want Nexus to create and we'll build it together."}
          </p>
        </div>
      )}
      
      <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5">
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

      <PromptBox
        onSend={handleSend}
        onStop={handleStop}
        thinking={thinking}
     />
    </div>
  );
}