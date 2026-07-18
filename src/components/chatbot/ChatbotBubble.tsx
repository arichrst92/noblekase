/**
 * ChatbotBubble — asisten AI Noblekase (streaming dari /api/ai/chat).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Desktop: panel melayang kanan-bawah. Mobile: bottom sheet.
 * Auto-bounce sekali di halaman detail produk setelah beberapa detik.
 * Semua teks tampilan berasal dari Site Settings.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  defaultLocale,
  localePath,
  stripLocale,
  translator,
  type Locale,
} from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatbotConfig {
  enabled?: boolean;
  title?: string;
  statusText?: string;
  placeholder?: string;
  greeting?: string;
  autoTriggerSeconds?: number;
  locale?: Locale;
}

export function ChatbotBubble({
  enabled = true,
  title,
  statusText,
  placeholder,
  greeting,
  autoTriggerSeconds = 0,
  locale = defaultLocale,
}: ChatbotConfig) {
  const tr = translator(locale);
  const titleText = title ?? tr("chatbot.title");
  const statusTextValue = statusText ?? tr("chatbot.status");
  const placeholderText = placeholder ?? tr("chatbot.placeholder");
  const greetingText = greeting ?? tr("chatbot.greeting");
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Auto-bounce sekali di halaman detail produk
  useEffect(() => {
    if (!enabled || open || autoTriggerSeconds <= 0) return;
    // Prefix locale dilepas dulu supaya /en/produk/detail/... ikut terdeteksi.
    if (!stripLocale(pathname ?? "/").path.startsWith("/produk/detail/")) return;
    if (sessionStorage.getItem("nk-chat-bounced")) return;
    const t = setTimeout(() => {
      setBounce(true);
      sessionStorage.setItem("nk-chat-bounced", "1");
      setTimeout(() => setBounce(false), 4000);
    }, autoTriggerSeconds * 1000);
    return () => clearTimeout(t);
  }, [enabled, open, pathname, autoTriggerSeconds]);

  // Selalu gulir ke pesan terbaru
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  if (!enabled) return null;

  async function send() {
    const question = input.trim();
    if (!question || streaming) return;

    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, locale }),
      });

      if (!res.body) {
        const text = await res.text();
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: text }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", content: tr("chatbot.connectionError") },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  /**
   * Ubah tautan internal di jawaban menjadi link yang bisa diklik.
   * Path diberi prefix locale, tapi teks yang tampil tetap path aslinya.
   */
  function renderContent(text: string) {
    const parts = text.split(/(\/[a-z0-9/-]+)/gi);
    return parts.map((part, i) =>
      /^\/(produk|journal|tentang|dukungan|cari)/i.test(part) ? (
        <a
          key={i}
          href={localePath(locale, part)}
          className="underline underline-offset-2 hover:opacity-80"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }

  const thread = (
    <>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        <div className="bg-bg-warm rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] text-sm">
          {greetingText}
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "px-3.5 py-2.5 text-sm max-w-[85%] rounded-2xl whitespace-pre-wrap",
              m.role === "user"
                ? "bg-ink-primary text-bg-base rounded-br-sm ml-auto"
                : "bg-bg-warm rounded-bl-sm",
            )}
          >
            {m.content ? renderContent(m.content) : <span className="opacity-60">…</span>}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border-light flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={placeholderText}
          aria-label={tr("chatbot.inputAriaLabel")}
          className="flex-1 px-3 py-2 text-sm border border-border-light rounded-full focus:outline-none focus:border-ink-primary"
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          aria-label={tr("chatbot.send")}
          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-40 hover:bg-ink-primary transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  const header = (
    <div className="bg-ink-primary text-bg-base px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-[11px] opacity-70">{statusTextValue}</div>
        <div className="text-sm font-medium">{titleText}</div>
      </div>
      <button
        onClick={() => setOpen(false)}
        aria-label={tr("chatbot.closeChat")}
        className="p-1 opacity-80 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50",
          "w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent text-white",
          "flex items-center justify-center shadow-deep",
          "hover:scale-105 active:scale-95 transition-transform",
          bounce && "animate-bounce",
        )}
        aria-label={open ? tr("chatbot.closeChat") : tr("chatbot.openChat")}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Desktop */}
      {open && (
        <div className="hidden md:flex fixed bottom-24 right-6 z-50 w-[380px] h-[520px] flex-col bg-bg-base border border-border-mid rounded-xl shadow-deep overflow-hidden">
          {header}
          {thread}
        </div>
      )}

      {/* Mobile — bottom sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-ink-primary/40"
            onClick={() => setOpen(false)}
            aria-label={tr("chatbot.closeChat")}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[78vh] flex flex-col bg-bg-base rounded-t-2xl overflow-hidden">
            {header}
            {thread}
          </div>
        </div>
      )}
    </>
  );
}
