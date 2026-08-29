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
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSend = () => {
    if (thinking || uploading) return;

    // Allow either text OR an uploaded file
    if (!message.trim() && !uploadedFilename) return;

    onSend(
      message.trim(),
      uploadedFilename || undefined
    );

    setMessage("");
    setSelectedFile(null);
    setUploadedFilename(null);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setSelectedFile(file);

      console.log("Uploading file:", file.name);

      const result = await uploadFile(file);

      console.log("Upload successful:", result);

      // Use the filename returned by the backend
      setUploadedFilename(result.filename);
    } catch (err) {
      console.error("Upload failed:", err);

      alert("Failed to upload file.");

      setSelectedFile(null);
      setUploadedFilename(null);
    } finally {
      setUploading(false);
    }
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
          disabled={thinking || uploading}
          onChange={handleFileChange}
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

          {uploading && (
            <span className="text-cyan-400">
              Uploading...
            </span>
          )}

          {!uploading && uploadedFilename && (
            <span className="text-green-400">
              ✓
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setUploadedFilename(null);
            }}
            className="text-red-400 hover:text-red-300"
            disabled={uploading}
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
        disabled={thinking || uploading}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      {/* Send / Stop */}
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
          disabled={uploading}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 font-medium text-white transition hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send →
        </button>
      )}

    </div>
  );
}