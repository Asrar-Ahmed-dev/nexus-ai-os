export default function StatusPanel() {
  return (
    <aside className="w-[360px] border-l border-white/10 bg-[#0D0D13] p-8">
      <div className="space-y-6">
        {/* Nexus Core */}
        <div className="rounded-3xl border border-white/10 bg-[#171720] p-8">
          <p className="text-center text-xs tracking-[0.3em] text-cyan-400">
            NEXUS CORE
          </p>

          <div className="mt-8 flex justify-center">
            <div className="relative h-40 w-40">
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-purple-500/20"></div>
              <div className="absolute inset-3 rounded-full border border-cyan-400/20"></div>
              <div className="absolute inset-6 rounded-full border border-white/10"></div>

              {/* Orb */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-500 shadow-[0_0_80px_rgba(147,51,234,.45)]"></div>

              {/* Indicator */}
              <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_18px_cyan]"></div>
            </div>
          </div>

          <h2 className="mt-6 text-center text-xl font-semibold">
            All systems nominal
          </h2>

          <p className="mt-2 text-center text-sm text-zinc-400">
            Model latency 214 ms
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#171720] p-5">
            <p className="text-3xl font-bold text-cyan-400">12</p>

            <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
              Active Chats
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171720] p-5">
            <p className="text-3xl font-bold text-purple-400">4</p>

            <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
              Tasks Due
            </p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-3xl border border-white/10 bg-[#171720] p-6">
          <h3 className="mb-5 text-xs tracking-[0.25em] text-zinc-400">
            TODAY
          </h3>

          <div className="space-y-4">
            <Task colour="bg-purple-400" task="DE Module 3 quiz review" time="10:30" />

            <Task colour="bg-cyan-400" task="Python MQP final pass" time="14:00" />

            <Task colour="bg-yellow-300" task="Numerical Methods Lab" time="16:15" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function Task({
  colour,
  task,
  time,
}: {
  colour: string;
  task: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${colour}`} />

        <span className="text-sm text-zinc-300">
          {task}
        </span>
      </div>

      <span className="text-xs text-zinc-500">
        {time}
      </span>
    </div>
  );
}