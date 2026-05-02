"use client"

import React, { useEffect, useRef, useState } from "react"

import type { WebChatMessage } from "@/lib/agents/chat-agent"

const GREETING: WebChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the GAFF fishing assistant 🎣 Ask me about our boats, availability, pricing, or the best fishing seasons in Cabo — I'll help you plan your perfect trip!",
}

const STORAGE_KEY = "gaff_chat_history"
const LEAD_ID_KEY = "gaff_chat_lead_id"
const CONTACT_KEY = "gaff_chat_contact"

type Contact = { name: string; email: string }

function renderMarkdown(text: string): React.ReactNode[] {
  const SAFE_URL = /^https?:\/\//

  return text.split("\n").flatMap((line, li, lines) => {
    // Split line into segments: plain text | **bold** | [label](url)
    const segments: React.ReactNode[] = []
    const pattern = /(\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\))/g
    let last = 0
    let m: RegExpExecArray | null

    while ((m = pattern.exec(line)) !== null) {
      if (m.index > last) segments.push(line.slice(last, m.index))
      if (m[2]) {
        segments.push(<strong key={`b-${li}-${m.index}`}>{m[2]}</strong>)
      } else if (m[3] && m[4] && SAFE_URL.test(m[4])) {
        segments.push(
          <a key={`a-${li}-${m.index}`} href={m[4]} target="_blank" rel="noopener noreferrer"
            className="underline text-amber-400 hover:text-amber-300 break-all">
            {m[3]}
          </a>
        )
      }
      last = m.index + m[0].length
    }
    if (last < line.length) segments.push(line.slice(last))

    const result: React.ReactNode[] = [<span key={`ln-${li}`}>{segments}</span>]
    if (li < lines.length - 1) result.push(<br key={`br-${li}`} />)
    return result
  })
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"intro" | "chat">("intro")
  const [contact, setContact] = useState<Contact>({ name: "", email: "" })
  const [leadId, setLeadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<WebChatMessage[]>([GREETING])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // Restore persisted state
  useEffect(() => {
    try {
      const savedLeadId = localStorage.getItem(LEAD_ID_KEY)
      const savedContact = localStorage.getItem(CONTACT_KEY)
      const savedHistory = localStorage.getItem(STORAGE_KEY)

      if (savedLeadId) setLeadId(savedLeadId)
      if (savedContact) setContact(JSON.parse(savedContact) as Contact)

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as WebChatMessage[]
        if (parsed.length > 0) {
          setMessages([GREETING, ...parsed])
          setStep("chat") // returning user — skip intro
        }
      } else if (savedLeadId) {
        setStep("chat") // lead already captured
      }
    } catch { /* ignore */ }
  }, [])

  // Persist history
  useEffect(() => {
    try {
      const toSave = messages.filter((m) => m !== GREETING)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* ignore */ }
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (!open) return
    if (step === "intro") setTimeout(() => nameRef.current?.focus(), 100)
    if (step === "chat") setTimeout(() => inputRef.current?.focus(), 100)
  }, [open, step])

  function startChat(withContact: Contact | null) {
    if (withContact?.name) {
      setContact(withContact)
      try { localStorage.setItem(CONTACT_KEY, JSON.stringify(withContact)) } catch { /* ignore */ }
    }
    setStep("chat")
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: WebChatMessage = { role: "user", content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput("")
    setLoading(true)

    try {
      const history = next.filter((m) => m !== GREETING)
      const body: Record<string, unknown> = {
        history: history.slice(0, -1),
        message: text,
      }

      if (leadId) {
        body.leadId = leadId
      } else if (contact.name) {
        body.contact = { name: contact.name, email: contact.email || undefined }
      }

      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as { reply?: string; handoffUrl?: string; leadId?: string }

      const reply = data.reply ?? "Sorry, something went wrong. Please try again. 🎣"
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
      if (data.handoffUrl) setHandoffUrl(data.handoffUrl)

      // Persist leadId returned from API
      if (data.leadId && !leadId) {
        setLeadId(data.leadId)
        try { localStorage.setItem(LEAD_ID_KEY, data.leadId) } catch { /* ignore */ }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I had a connection issue. Please try again. 🎣" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const waNumber = process.env.NEXT_PUBLIC_GAFF_WHATSAPP_NUMBER || "526241000381"
  const defaultHandoff = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I was chatting with GAFF All Fishing on your website and I'd like to continue here.")}`

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628] shadow-2xl"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">GAFF Assistant</p>
              <p className="text-xs text-white/40">Boats · Availability · Pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={handoffUrl ?? defaultHandoff}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366]/15 px-3 py-1.5 text-xs font-medium text-[#25D366] transition hover:bg-[#25D366]/25"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/40 transition hover:text-white"
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {step === "intro" ? (
            /* Intro: collect name + email */
            <div className="flex flex-1 flex-col justify-center gap-6 px-6">
              <div>
                <p className="text-base font-semibold text-white">Plan your Cabo trip 🎣</p>
                <p className="mt-1 text-sm text-white/50">
                  Share your name so the assistant can personalize your experience.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  startChat(contact.name.trim() ? contact : null)
                }}
                className="flex flex-col gap-3"
              >
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Your name *"
                  required
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email (optional — for follow-up)"
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!contact.name.trim()}
                  className="rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-40"
                >
                  Start chatting
                </button>
              </form>
              <button
                type="button"
                onClick={() => startChat(null)}
                className="text-xs text-white/30 underline transition hover:text-white/60"
              >
                Skip — chat anonymously
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-amber-500 text-black"
                          : "bg-white/10 text-white/90"
                      }`}
                    >
                      {renderMarkdown(m.content)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <span className="flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                )}
                {handoffUrl && (
                  <div className="flex justify-start">
                    <a
                      href={handoffUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-2xl bg-[#25D366]/15 px-4 py-3 text-sm text-[#25D366] transition hover:bg-[#25D366]/25"
                    >
                      <WhatsAppIcon />
                      Continue this conversation on WhatsApp →
                    </a>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about boats, dates, pricing..."
                  disabled={loading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-500/40 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-black transition hover:bg-amber-400 disabled:opacity-40"
                  aria-label="Send"
                >
                  <SendIcon />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg transition hover:bg-amber-400 hover:scale-105"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  )
}
