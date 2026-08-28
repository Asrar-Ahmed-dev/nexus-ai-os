"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";

import { getChats } from "../../services/api";

type Chat = {
  id: number;
  title: string;
};

export default function ChatsPage() {
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const chatId = searchParams.get("chat");

  const [selectedChat, setSelectedChat] = useState(0);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    async function loadChats() {
      try {
        const data = (await getChats()) as Chat[];

        setChats(data);

        /*
         * If Dashboard opened a specific chat,
         * select that chat.
         */
        if (chatId) {
          const id = Number(chatId);

          const chatExists = data.some(
            (chat) => chat.id === id
          );

          if (chatExists) {
            setSelectedChat(id);
            return;
          }
        }

        /*
         * Normal Chats page:
         * select the first available chat.
         */
        if (data.length > 0) {
          setSelectedChat(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load chats", err);
      }
    }

    loadChats();
  }, [chatId]);

  return (
    <main className="h-screen flex bg-[#0E0E13] text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <div className="flex-1 flex overflow-hidden">

          <ChatSidebar
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            chats={chats}
            setChats={setChats}
          />

          <div className="min-h-0 flex-1 p-8 overflow-hidden">

            {selectedChat > 0 && (
              <ChatWindow
                selectedChat={selectedChat}
                chats={chats}
                setChats={setChats}
                mode={mode}
              />
            )}

          </div>

        </div>

      </div>

    </main>
  );
}