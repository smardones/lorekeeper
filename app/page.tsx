"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CardSearch from "./CardSearch";

export default function Home() {
  const { messages, sendMessage, error, status } = useChat();
  const [input, setInput] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    console.log("chat error", error);
  }, [error]);

  useEffect(() => {
    console.log("chat messages", messages);
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <main className="flex flex-col h-screen">
      <CardSearch setInput={setInput} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <div className="bg-primary-light p-4 mb-4">
        <h1 className="text-3xl sm:text-4xl m-auto">Lorekeeper</h1>
        <h6 className="text-lg text-center sm:text-2xl m-auto max-w-[800px]">
          Have a question about Lorcana? Ask Lorekeeper!
        </h6>
      </div>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            Send a message to start chatting
            <span className="hidden md:inline">
              {" "}(If you don't remember the full name of a card, press Ctrl+K to search and reference cards in your question)
            </span>
            <span className="md:hidden">
              {" "}If you don't remember the full name of a card,click the Cards button to lookup specific cards
            </span>
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-2 max-w-[90%] sm:max-w-[80%] text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary-light"
                  : "bg-secondary"
              }`}
            >
              {m.parts.map((part, index) => (
                <ReactMarkdown key={m.id + index} remarkPlugins={[remarkGfm]}>
                  {part.type === "text" ? part.text : null}
                </ReactMarkdown>
              ))}
            </div>
          </div>
        ))}

        {status === "streaming" && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 text-red-600 rounded-2xl px-4 py-2 text-sm">
              Something went wrong. Please try again.
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2 pt-2 border-t border-gray-200 bg-primary-light p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status === "streaming"}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden bg-accent text-white rounded-xl px-3 py-2 text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Cards
        </button>
        <button
          type="submit"
          disabled={status === "streaming" || !input.trim()}
          className="bg-accent text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
      <footer className="h-[70px]" />
    </main>
  );
}
