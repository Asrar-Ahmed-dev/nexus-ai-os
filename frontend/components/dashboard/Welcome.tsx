"use client";

import { useRouter } from "next/navigation";

import {
  BarChart3,
  Code2,
  Search,
  Sparkles,
} from "lucide-react";

import { createChat } from "../../services/api";

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

    </section>
  );
}