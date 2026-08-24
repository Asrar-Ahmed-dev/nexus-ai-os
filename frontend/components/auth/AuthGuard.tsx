"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../lib/api";
import { getToken } from "../../lib/auth";

type User = {
  id: number;
  email: string;
  username: string;
};

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiFetch<{ user:User }>("/auth/me");

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setChecking(false);
      } catch {
        localStorage.removeItem("user");
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#0E0E13] text-white flex items-center justify-center">
        <p className="text-gray-400">
          Loading Nexus AI...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}