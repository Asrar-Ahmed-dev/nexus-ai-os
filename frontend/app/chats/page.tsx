import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatsPage() {
  return (
    <main className="h-screen flex bg-[#0E0E13] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex-1 overflow-hidden p-8">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}