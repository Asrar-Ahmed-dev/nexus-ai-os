export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#171720] px-5 py-4 w-fit">
      <span className="text-zinc-300">Nexus is thinking</span>

      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"></span>
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
          style={{ animationDelay: "0.15s" }}
        ></span>
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
          style={{ animationDelay: "0.3s" }}
        ></span>
      </div>
    </div>
  );
}