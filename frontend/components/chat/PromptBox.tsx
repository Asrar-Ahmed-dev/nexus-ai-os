"use client";

import { useState } from "react";
import { uploadFile } from "../../services/api";

type Props = {
  onSend: (message: string, filename?: string) => void;
  onStop: () => void;
  thinking: boolean;
};

export default function PromptBox({
  onSend,
  onStop,
  thinking,
}: Props) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSend = () => {
    if ((!message.trim() && !selectedFile) || thinking) return;

    if (message.trim()) {
      onSend(message, selectedFile?.name);
      setMessage("");
    }

    setSelectedFile(null);
  };

  return (
    <div className="flex items-center gap-3">

      {/* Attachment Button */}
      <>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.txt,.docx"
          onChange={async (e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            try {
              setSelectedFile(file);

              console.log("Uploading file:", file.name);

              const result = await uploadFile(file);

              console.log("Upload successful:", result);
            } catch (err) {
              console.error("Upload failed:", err);
              alert("Failed to upload file.");
              setSelectedFile(null);
            }
          }}
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer text-zinc-400 transition hover:text-cyan-400"
          title="Attach file"
        >
          📎
        </label>
      </>

      {/* Selected File */}
      {selectedFile && (
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-zinc-300">
          📄 {selectedFile.name}

          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

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