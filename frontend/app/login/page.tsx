"use client";
import { apiFetch } from "../../lib/api";
import { setToken } from "../../lib/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
type LoginResponse = {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id:number;
    email:string;
    username:string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch<LoginResponse>("/auth/login",{
        method: "POST",
        body: JSON.stringify({
          email,
          password,

        }),
      });
      // Save JWT using our auth helper
      setToken(data.access_token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user) 
      );
      
      // GO to dashboard
      router.push("/");
    } catch(err){
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
     );
    }finally{
        setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0E0E13] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">
            Nexus AI
          </h1>

          <p className="text-gray-400 mt-2">
            Welcome back
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#17171F] border border-white/10 rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold mb-6">
            Login
          </h2>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
                className="w-full rounded-lg bg-[#0E0E13] border border-white/10 px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                className="w-full rounded-lg bg-[#0E0E13] border border-white/10 px-4 py-3 outline-none focus:border-purple-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 font-medium transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}