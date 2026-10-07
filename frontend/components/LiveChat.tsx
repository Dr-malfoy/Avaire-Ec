"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

interface Message {
  _id?: string;
  id?: string | number;
  content: string;
  sender: "customer" | "admin";
  createdAt: string;
}

interface Conversation {
  _id?: string;
  id?: string | number;
  status: "open" | "closed";
  unreadByCustomer: number;
}

function getOrCreateSessionId(): string {
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("chat_session_id", id);
  }
  return id;
}

export default function LiveChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [sendError, setSendError] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/chat?sessionId=${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
  }, []);

  // Poll for new messages when chat is open and conversation exists
  useEffect(() => {
    if (open && conversation) {
      const sessionId = localStorage.getItem("chat_session_id");
      if (sessionId) {
        fetchMessages(sessionId);
        pollRef.current = setInterval(() => fetchMessages(sessionId), 3000);
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, conversation, fetchMessages]);

  // Poll unread count when chat is closed
  useEffect(() => {
    if (!conversation || open) return;
    const check = async () => {
      const sessionId = localStorage.getItem("chat_session_id");
      if (!sessionId) return;
      const res = await fetch(`/api/chat?sessionId=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.conversation) setUnread(data.conversation.unreadByCustomer ?? 0);
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, [conversation, open]);

  // Clear unread when opening
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages]);

  // Restore existing session on mount
  useEffect(() => {
    const sessionId = localStorage.getItem("chat_session_id");
    if (!sessionId) return;
    fetch(`/api/chat?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.conversation) {
          setConversation(data.conversation);
          setStarted(true);
          setUnread(data.conversation.unreadByCustomer ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  const startChat = async () => {
    if (!name.trim() || starting) return;
    setStarting(true);
    setStartError("");
    try {
      const sessionId = getOrCreateSessionId();
      const res = await fetch(`/api/chat?sessionId=${sessionId}&name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (!data.conversation) throw new Error("No conversation returned");
      setConversation(data.conversation);
      setStarted(true);
      await fetchMessages(sessionId);
    } catch (err) {
      setStartError("Could not connect. Please try again.");
      console.error("startChat error:", err);
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sending) return;
    setSendError("");
    setSending(true);
    const content = input.trim();
    const tempId = `temp_${Date.now()}`;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: tempId, _id: tempId, content, sender: "customer", createdAt: new Date().toISOString() },
    ]);
    scrollToBottom();
    try {
      const sessionId = localStorage.getItem("chat_session_id");
      const res = await fetch(`/api/chat/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sender: "customer" }),
      });
      if (!res.ok) throw new Error("Send failed");
      await fetchMessages(sessionId!);
    } catch {
      // Roll back optimistic message and restore input
      setMessages((prev) => prev.filter((m) => (m.id ?? m._id) !== tempId));
      setInput(content);
      setSendError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render the widget on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 10000,
          width: 360, maxWidth: "calc(100vw - 48px)",
          background: "#fff",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
          fontFamily: "DM Sans, sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background: "#0a0a0a", padding: "16px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: "#fafaf8", letterSpacing: "0.1em" }}>AVIAR</div>
              <div style={{ fontSize: 11, color: "#c9a96e", letterSpacing: "0.15em", textTransform: "uppercase" }}>Live Support</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.5)",
              cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4,
            }}>✕</button>
          </div>

          {!started ? (
            /* Start form */
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 13, color: "#4a4a4a", margin: 0, lineHeight: 1.6 }}>
                Hi there! How can we help you today? Please enter your name to start chatting.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name *"
                style={{
                  border: "0.5px solid rgba(0,0,0,0.2)", padding: "10px 12px",
                  fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif",
                }}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                type="email"
                style={{
                  border: "0.5px solid rgba(0,0,0,0.2)", padding: "10px 12px",
                  fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif",
                }}
              />
              {startError && (
                <div style={{ fontSize: 12, color: "#b91c1c", padding: "4px 0" }}>{startError}</div>
              )}
              <button
                onClick={startChat}
                disabled={!name.trim() || starting}
                style={{
                  background: name.trim() && !starting ? "#c9a96e" : "#e5e5e5",
                  border: "none", padding: "12px",
                  fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: name.trim() && !starting ? "pointer" : "default",
                  color: "#0a0a0a", fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.2s",
                }}
              >
                {starting ? "Connecting…" : "Start Chat"}
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "16px 14px",
                display: "flex", flexDirection: "column", gap: 8,
                minHeight: 300, maxHeight: 380, background: "#fafaf8",
              }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#8a8680", fontSize: 13 }}>
                    Send a message to get started — we typically reply within minutes.
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={msg.id ?? msg._id ?? `chat-msg-${idx}-${msg.createdAt}`} style={{
                    display: "flex",
                    justifyContent: msg.sender === "customer" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "76%",
                      padding: "9px 13px",
                      background: msg.sender === "customer" ? "#0a0a0a" : "#fff",
                      color: msg.sender === "customer" ? "#fafaf8" : "#0a0a0a",
                      fontSize: 13, lineHeight: 1.5,
                      border: msg.sender === "admin" ? "0.5px solid rgba(0,0,0,0.1)" : "none",
                      borderRadius: msg.sender === "customer"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    }}>
                      {msg.content}
                      <div style={{
                        fontSize: 10, marginTop: 4, opacity: 0.5,
                        textAlign: msg.sender === "customer" ? "right" : "left",
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {sendError && (
                <div style={{ padding: "6px 14px", background: "#fff0f0", fontSize: 11, color: "#b91c1c", borderTop: "0.5px solid rgba(185,28,28,0.15)" }}>
                  {sendError}
                </div>
              )}
              <div style={{
                borderTop: "0.5px solid rgba(0,0,0,0.08)",
                padding: "10px 12px",
                display: "flex", gap: 8, background: "#fff",
              }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  style={{
                    flex: 1, border: "none", outline: "none", resize: "none",
                    fontSize: 13, lineHeight: 1.5, fontFamily: "DM Sans, sans-serif",
                    background: "transparent", padding: "6px 4px", maxHeight: 80, overflowY: "auto",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{
                    background: input.trim() && !sending ? "#c9a96e" : "#e5e5e5",
                    border: "none", borderRadius: 2, padding: "8px 14px",
                    cursor: input.trim() && !sending ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 10000,
          width: 56, height: 56, borderRadius: "50%",
          background: "#0a0a0a", border: "none",
          cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s, background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fafaf8" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fafaf8" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {/* Unread badge */}
        {unread > 0 && !open && (
          <div style={{
            position: "absolute", top: 2, right: 2,
            background: "#c9a96e", color: "#0a0a0a",
            borderRadius: "50%", width: 18, height: 18,
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </button>
    </>
  );
}
