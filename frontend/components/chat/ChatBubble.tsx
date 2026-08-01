"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBubble({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-4 transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
            : "border border-white/10 bg-white/5 backdrop-blur-md text-zinc-100"
        }`}
      >
        {isUser ? (
          content
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}