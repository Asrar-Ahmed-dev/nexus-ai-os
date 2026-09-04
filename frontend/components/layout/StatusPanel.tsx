"use client";

import { useEffect, useState } from "react";

import { getTasks, getChats, PlannerTask } from "../../services/api";

export default function StatusPanel() {
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [taskData, chatData] = await Promise.all([
          getTasks(),
          getChats(),
        ]);
        setTasks(taskData);
        setChatCount(chatData.length);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    }

    loadDashboardData();
  }, []);

  const now = new Date();

  const today =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;

  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.due_date);

    const taskDate =
      `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(
        dueDate.getDate()
      ).padStart(2, "0")}`;

    return taskDate === today && !task.completed;
  });

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
            <p className="text-3xl font-bold text-cyan-400">{chatCount}</p>

            <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
              Active Chats
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#171720] p-5">
            <p className="text-3xl font-bold text-purple-400">{todayTasks.length}</p>

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

            {todayTasks.length === 0 ? (

              <p className="text-sm text-zinc-500">
                No tasks due today.
              </p>

            ) : (

              todayTasks.slice(0, 4).map((task, index) => {

                const dueDate = new Date(task.due_date);

                const time = dueDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                const colours = [
                  "bg-purple-400",
                  "bg-cyan-400",
                  "bg-yellow-300",
                  "bg-pink-400",
                ];

                return (
                  <Task
                    key={task.id}
                    colour={colours[index % colours.length]}
                    task={task.title}
                    time={time}
                  />
                );

              })

            )}

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