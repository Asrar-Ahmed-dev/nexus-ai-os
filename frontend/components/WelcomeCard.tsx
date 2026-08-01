export default function WelcomeCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full">

      <h1 className="text-5xl font-bold">
        👋 Hello Asrar
      </h1>

      <p className="text-zinc-400 mt-4 text-lg">
        What would you like to do today?
      </p>

      <div className="flex gap-4 mt-10">

        <button className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700">
          Analyze
        </button>

        <button className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700">
          Code
        </button>

        <button className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700">
          Research
        </button>

        <button className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700">
          Create
        </button>

      </div>

    </div>
  );
}