"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Topbar() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const dateTime = currentTime
    ? currentTime.toLocaleString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }) + " IST"
    :"";


  const titles: Record<string, string> = {
   "/": "Dashboard",
   "/chats": "Chats",
   "/files": "Files",
   "/notes": "Notes",
   "/planner": "Planner",
   "/settings": "Settings",
  };

  const title = titles[pathname] || "Nexus AI";
  return (
    <header className="h-24 border-b border-zinc-800 flex items-center justify-between px-10 bg-[#0E0E13]">

      <div>
        <h2 className="text-3xl font-semibold text-white">
          {title}
        </h2>

        <p className="text-zinc-500 mt-1">
          {dateTime}
        </p>
      </div>

      <div className="flex items-center gap-5">

        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 h-14 w-80">

          <Search
            className="text-zinc-500"
            size={20}
          />

          <input
            placeholder="Search Nexus..."
            className="bg-transparent outline-none flex-1 text-white placeholder:text-zinc-500"
          />

        </div>

        <button className="h-14 px-6 rounded-2xl border border-zinc-700 bg-zinc-900 text-white flex items-center gap-3">

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
            AA
          </div>

          Profile

        </button>

      </div>

    </header>
  );
}