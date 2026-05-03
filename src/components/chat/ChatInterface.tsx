"use client";

import { useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { useChat } from "@/lib/contexts/chat-context";
import { Bot } from "lucide-react";

export function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 mb-4 shadow-sm">
            <Bot className="h-7 w-7 text-blue-600" />
          </div>
          <p className="text-neutral-900 font-semibold text-lg mb-2">Start a conversation to generate React components</p>
          <p className="text-neutral-500 text-sm max-w-sm">I can help you create buttons, forms, cards, and more</p>
        </div>
      ) : (
        <div ref={scrollAreaRef} className="flex-1 overflow-auto">
          <div className="pr-4">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>
        </div>
      )}
      <div className="mt-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe a component..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
