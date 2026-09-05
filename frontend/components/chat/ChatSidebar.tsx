"use client";

import React from "react";
import {
  createChat,
  getChats,
  deleteChat,
} from "../../services/api";

type Chat = {
  id: number;
  title: string;
};

type ChatSidebarProps = {
  selectedChat: number;
  setSelectedChat: (id: number) => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
};

export default function ChatSidebar({
  selectedChat,
  setSelectedChat,
  chats,
  setChats,
}: ChatSidebarProps) {

  async function loadChats() {
    try {
      const data = await getChats();

      setChats(data);

      if (data.length > 0 && selectedChat === 1) {
        setSelectedChat(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  }

  const handleNewChat = async () => {
    const chat = await createChat();

    await loadChats();

    setSelectedChat(chat.id);
  };
  async function handleDeleteChat( chatId: number) {
    try {
      await deleteChat(chatId);

      await loadChats();

      if (selectedChat === chatId) {
        const remaining = chats.filter(
          (chat) => chat.id !== chatId
        );

        if (remaining.length > 0) {
          setSelectedChat(remaining[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  }
  return (
  <div className="w-72 border-r border-white/10 bg-[#111118] flex flex-col">
    {/* Header */}
    <div className="p-5 border-b border-white/10">
      <button
        onClick={handleNewChat}
        className="
          w-full
          rounded-xl
          bg-blue-500
          py-3
          font-medium
          text-white
          hover:opacity-90
          transition
        "
      >
        + New Chat
      </button>
    </div>

    {/* Chat List */}
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`
            flex
            items-center
            rounded-xl
            ${
              selectedChat === chat.id
                ? "bg-blue-500"
                : "bg-white/10 hover:bg-white/20"
            }
          `}
        >
          <button
            onClick={() => setSelectedChat(chat.id)}
            className="flex-1 px-4 py-3 text-left rounded-l-xl"
          >
            {chat.title}
          </button>

          <button
            onClick={() => handleDeleteChat(chat.id)}
            className="px-3 text-red-400 hover:text-red-300"
            title="Delete chat"
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  </div>
);
}