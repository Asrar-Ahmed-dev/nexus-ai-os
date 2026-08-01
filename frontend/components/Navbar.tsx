export default function Navbar() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6">

      <h2 className="text-xl font-semibold text-white">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <input
          type="text"
          placeholder="Search..."
          className="bg-zinc-800 text-white rounded-lg px-4 py-2 outline-none"
        />

        <button className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700">
          Profile
        </button>

      </div>

    </header>
  );
}