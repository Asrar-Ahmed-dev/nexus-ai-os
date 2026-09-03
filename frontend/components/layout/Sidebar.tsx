"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { removeToken } from "../../lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageCircle,
  Folder,
  Notebook,
  Calendar,
  Settings,
} from "lucide-react";

const menu = [
  { icon: LayoutDashboard, title: "Dashboard", href:"/" },
  { icon: MessageCircle, title: "Chats", href: "/chats" },
  { icon: Folder, title: "Files", href: "/files" },
  { icon: Notebook, title: "Notes", href: "/notes" },
  { icon: Calendar, title: "Planner", href: "/planner" },
  { icon: Settings, title: "Settings", href: "#" },
];
type User = {
  id: number;
  email: string;
  username: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  function handleLogout() {
    removeToken();
    localStorage.removeItem("user");

    router.replace("/login");
  }
  return (
    <aside className="w-72 bg-[#111116] border-r border-zinc-800 flex flex-col justify-between">

      <div>

        {/* Logo */}

        <div className="p-8 flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            N
          </div>

          <div>
            <h1 className="text-white font-semibold text-2xl">
              Nexus
            </h1>

            <p className="text-zinc-500 tracking-[0.35em] text-xs">
              AI OS
            </p>

          </div>

        </div>

        {/* Navigation */}

        <nav className="px-4 mt-8 space-y-2">

          {menu.map((item, index) => {

            const Icon = item.icon;

            return (
            <Link key={index} href={item.href}>
              <button
              
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon size={22} />
                <span className="text-lg">{item.title}</span>
              </button>
            </Link>
            );
          })}

        </nav>

      </div>

      {/* User */}

      <div className="p-5">

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold">
            {user?.username
              ? user.username
                  .split("")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()
                  .slice(0,2)
              : "U"}
          </div>

          <div>

            <h3 className="text-white">
              {user?.username || "User"}
            </h3>

            <p className="text-green-400 text-sm">
              ● Online
            </p>

          </div>

        </div>
        <button
        onClick={handleLogout}
        className="mt-4 w-full rounded-x1 border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
        >
          Logout
        </button>
      

      </div>
    </div>

  </aside>
  );
}