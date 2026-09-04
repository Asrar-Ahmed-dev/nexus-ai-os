"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BarChart3,
  Code2,
  Search,
  Sparkles,
  CalendarDays,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";

import { createChat, getTasks, PlannerTask } from "../../services/api";

const cards = [
  {
    icon: BarChart3,
    title: "Analyze",
    desc: "Explore data, trends & files",
    mode: "analyze",
  },
  {
    icon: Code2,
    title: "Code",
    desc: "Write & debug programs",
    mode: "code",
  },
  {
    icon: Search,
    title: "Research",
    desc: "Go deep on any topic",
    mode: "research",
  },
  {
    icon: Sparkles,
    title: "Create",
    desc: "Docs, slides & more",
    mode: "create",
  },
];

export default function Welcome() {
  const router = useRouter();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error("Failed to load planner tasks:", error);
      }
    }

    loadTasks();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((task) => {
    const dueDate = new Date(task.due_date)
      .toISOString()
      .split("T")[0];

    return dueDate === today;
  });

  async function handleCardClick(mode: string) {
    try {
      const newChat = await createChat();

      router.push(
        `/chats?mode=${mode}&chat=${newChat.id}`
      );
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  }

  return (
    <section className="space-y-10">

      {/* System Ready */}
      <div>
        <p className="uppercase tracking-[0.35em] text-cyan-400 text-sm font-semibold">
          — SYSTEM READY
        </p>

        <h1 className="mt-5 text-7xl font-bold leading-tight">
          Good morning,

          <br />

          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Asrar.
          </span>
        </h1>

        <p className="mt-5 text-zinc-400 text-xl">
          What would you like to do today?
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-4 gap-6">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.title}
              onClick={() => handleCardClick(card.mode)}
              className="
                rounded-3xl
                border
                border-zinc-800
                bg-[#18181f]
                p-8
                text-left
                transition-all
                hover:border-cyan-500
                hover:-translate-y-1
                hover:shadow-[0_0_40px_rgba(70,160,255,.18)]
              "
            >
              <Icon
                size={34}
                className="text-yellow-300 mb-8"
              />

              <h2 className="text-2xl font-semibold text-white">
                {card.title}
              </h2>

              <p className="mt-4 text-zinc-400 leading-7">
                {card.desc}
              </p>
            </button>
          );
        })}

      </div>
      {/* Planner Preview */}
      <div className="rounded-3xl border border-zinc-800 bg-[#18181f] p-7">

        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-3">
              <CalendarDays
                size={22}
                className="text-cyan-400"
              />

              <h2 className="text-2xl font-semibold">
                Today's Planner
              </h2>
            </div>

            <p className="mt-2 text-zinc-500">
              Stay on top of your tasks and priorities.
            </p>
          </div>

          <button
            onClick={() => router.push("/planner")}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            View Planner
            <ArrowRight size={16} />
          </button>

        </div>


        {/* Tasks */}

        <div className="mt-6 space-y-3">

          {todayTasks.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center">

              <CalendarDays
                size={28}
                className="mx-auto text-zinc-600"
              />

              <p className="mt-3 text-zinc-500">
                No tasks yet.
              </p>

              <button
                onClick={() => router.push("/planner")}
                className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
              >
                Create your first task →
              </button>

            </div>

          ) : (

            todayTasks.slice(0, 3).map((task) => {

              const dueDate = new Date(task.due_date);

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-[#101017] p-4"
                >

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      task.completed
                        ? "bg-green-500/10 text-green-400"
                        : "bg-cyan-500/10 text-cyan-400"
                    }`}
                  >
                    {task.completed ? (
                      <Check size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>


                  <div className="min-w-0 flex-1">

                    <h3
                      className={`font-medium ${
                        task.completed
                          ? "text-zinc-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {task.description}
                      </p>
                    )}

                  </div>


                  <div className="shrink-0 text-right text-sm text-zinc-500">

                    <p>
                      {dueDate.toLocaleDateString()}
                    </p>

                    <p className="mt-1 flex items-center justify-end gap-1">
                      <Clock size={13} />
                      {dueDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                  </div>

                </div>
              );

            })

          )}

        </div>

      </div>
    </section>
  );
}