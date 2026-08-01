export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white p-6 border-r border-zinc-800">

      <h1 className="text-2xl font-bold mb-10">
        Nexus AI OS
      </h1>

      <nav className="space-y-4">

        <button className="w-full text-left hover:text-indigo-400">
          🏠 Dashboard
        </button>

        <button className="w-full text-left hover:text-indigo-400">
          💬 Chats
        </button>

        <button className="w-full text-left hover:text-indigo-400">
          📁 Files
        </button>

        <button className="w-full text-left hover:text-indigo-400">
          📝 Notes
        </button>

        <button className="w-full text-left hover:text-indigo-400">
          📅 Planner
        </button>

        <button className="w-full text-left hover:text-indigo-400">
          ⚙ Settings
        </button>

      </nav>

    </aside>
  );
}