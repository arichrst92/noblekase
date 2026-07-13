/**
 * ChatbotBubble — floating bubble bottom-right
 *
 * Klik bubble = open chat panel (desktop) atau bottom sheet (mobile).
 * Smart trigger: auto-bounce setelah 30 detik di Produk Detail tanpa klik CTA.
 *
 * TODO Phase 3:
 *  - Connect ke /api/ai/chat endpoint (Groq Llama 3.1 8B)
 *  - Implement RAG dari produk database
 *  - Bottom sheet UI untuk mobile
 *  - Auto-bounce trigger logic
 */

"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function ChatbotBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50",
          "w-12 h-12 md:w-14 md:h-14 rounded-full bg-ink-primary text-bg-base",
          "flex items-center justify-center shadow-deep",
          "hover:scale-105 active:scale-95 transition-transform"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat with AI Assistant"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </button>

      {/* Chat panel — desktop */}
      {isOpen && (
        <div className="hidden md:flex fixed bottom-24 right-6 z-50 w-[360px] h-[480px] flex-col bg-bg-base border border-border-mid rounded-xl shadow-deep overflow-hidden">
          <div className="bg-ink-primary text-bg-base px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] opacity-70">Online · 24/7</div>
              <div className="text-sm font-medium">AI Assistant Noblekase</div>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-bg-warm rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] text-sm">
              Halo! Ada yang bisa saya bantu seputar produk Noblekase?
            </div>
          </div>
          <div className="p-3 border-t border-border-light">
            <input
              type="text"
              placeholder="Ketik pertanyaan..."
              className="w-full px-3 py-2 text-sm border border-border-light rounded-full focus:outline-none focus:border-ink-primary"
            />
          </div>
        </div>
      )}
    </>
  );
}
