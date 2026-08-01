"use client";

import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
};

export default function PromptBox({ onSend }: Props) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (
  <div className="border-t border-white/10 bg-[#171720] p-5">
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111118] px-4 py-3">

      {/* Attachment Button */}
      <button
        className="text-zinc-400 transition hover:text-cyan-400"
        title="Attach file"
      >
        📎
      </button>

      {/* Input */}
      <input
        className="flex-1 bg-transparent text-white placeholder:text-zinc-500 outline-none"
        placeholder="Ask Nexus anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 font-medium text-white transition hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
      >
        Send →
      </button>

    </div>
  </div>
);
}