"use client";

import { useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatsPage() {

  const [selectedChat, setSelectedChat] = useState(1);

  return (
    <main className="h-screen flex bg-[#0E0E13] text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <div className="flex-1 flex overflow-hidden">

          <ChatSidebar
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
          />

          <div className="flex-1 p-8 overflow-hidden">

            <ChatWindow
              selectedChat={selectedChat}
            />

          </div>

        </div>

      </div>

    </main>
  );
}