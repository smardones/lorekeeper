"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const { messages, sendMessage, error, status  } =
    useChat();
    const [input, setInput] = useState("");

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      console.log('chat error', error)
    }, [error])


    useEffect(() => {
      console.log('chat messages', messages)
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      
      }
    }, [messages]);

      return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-20">
            Send a message to start chatting
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.parts.map((part, index) => (
                <span key={m.id + index}>{part.type === 'text' ? part.text : null}</span>
              ))}
            </div>
          </div>
        ))}

        {status === 'streaming' && (
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
      <form onSubmit={(e) => {
        e.preventDefault();
          sendMessage({ text: input });
          setInput('');
      }} className="flex gap-2 pt-2 border-t border-gray-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status === 'streaming'}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'streaming' || !input.trim()}
          className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>

    </main>
    )
}
