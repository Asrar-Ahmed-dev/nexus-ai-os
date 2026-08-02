"use client";

import { useState } from "react";
import { createChat } from "../../services/api";

type ChatSidebarProps = {
  selectedChat: number;
  setSelectedChat: (id: number) => void;
};

export default function ChatSidebar({
  selectedChat,
  setSelectedChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState([
    {
      id: 1,
      title: "New Chat",
    },
  ]);

  

  const handleNewChat = async () => {
    const chat = await createChat();

    setChats([...chats, chat]);
    setSelectedChat(chat.id);
  };

  return (
    <div className="w-72 border-r border-white/10 bg-[#111118] flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <button
          onClick={handleNewChat}
          className="
            w-full
            rounded-xl
            bg-indigo-600
            py-3
            font-medium
            hover:bg-indigo-500
            transition
          "
        >
          + New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            className={`
              w-full
              rounded-xl
              px-4
              py-3
              text-left
              transition
              ${
                selectedChat === chat.id
                  ? "bg-indigo-600"
                  : "bg-white/10 hover:bg-white/20"
              }
            `}
          >
            {chat.title}
          </button>
        ))}
      </div>

    </div>
  );
}