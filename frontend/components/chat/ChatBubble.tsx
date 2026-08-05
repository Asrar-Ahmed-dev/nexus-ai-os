"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBubble({
  role,
  content,
}: Props) {
  const isUser = role === "user";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedCode(text);

    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[85%]
          rounded-2xl
          px-5
          py-4
          ${
            isUser
              ? "bg-indigo-600 text-white"
              : "bg-[#1B1B24] text-white border border-white/10"
          }
        `}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(
                className || ""
              );

              return !inline && match ? (
               <div className="rounded-xl overflow-hidden border border-white/10 my-4">
                <div className="flex items-center justify-between bg-[#16161d] px-4 py-2 text-sm text-gray-300">
                  <span>{match[1]}</span>
                  <button
                    onClick={() => handleCopy(String(children))}
                    className="hover:text-white text-sm"
                  >
                    {copiedCode == String(children) ? "✅ Copied" : "📋 Copy"}
                  </button>
                </div>

                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
                <code
                  className="bg-black/40 px-1 rounded"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}