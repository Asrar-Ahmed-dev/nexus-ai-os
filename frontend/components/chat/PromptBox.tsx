"use client";

import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
  onStop: () => void;
  thinking: boolean;
};

export default function PromptBox({
  onSend,
  onStop,
  thinking,
}: Props) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || thinking) return;

    onSend(message);
    setMessage("");
  };

  return (
    <div className="flex items-center gap-3 border-t border-white/10 p-4">

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
        disabled={thinking}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      {/* Send / Stop Button */}
      {thinking ? (
        <button
          onClick={onStop}
          className="rounded-xl bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-500"
        >
          ■ Stop
        </button>
      ) : (
        <button
          onClick={handleSend}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 font-medium text-white transition hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
        >
          Send →
        </button>
      )}
    </div>
  );
}