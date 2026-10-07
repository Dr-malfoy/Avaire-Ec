"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/authFetch";

interface Conversation {
  _id?: string;
  id?: string | number;
  customerName: string;
  customerEmail: string;
  status: "open" | "closed";
  unreadByAdmin: number;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

interface Message {
  _id?: string;
  id?: string | number;
  content: string;
  sender: "customer" | "admin";
  createdAt: string;
}

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/chat");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? (Array.isArray(data) ? data : []));
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await authFetch(`/api/admin/chat/${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
      setSelectedConv(data.conversation ?? null);
      setConversations((prev) =>
        prev.map((c) => (String(c.id ?? c._id) === String(convId) ? { ...c, unreadByAdmin: 0 } : c))
      );
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      console.error("fetchMessages error:", e);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const id = setInterval(fetchConversations, 5000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected);
    const id = setInterval(() => fetchMessages(selected), 3000);
    return () => clearInterval(id);
  }, [selected, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (convId: string) => {
    setSelected(convId);
    if (!isDesktop) setMobileView("chat");
  };

  const sendReply = async () => {
    if (!input.trim() || !selected || sending) return;
    setReplyError("");
    setSending(true);
    const content = input.trim();
    const tempId = `temp_${Date.now()}`;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: tempId, _id: tempId, content, sender: "admin", createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await authFetch(`/api/admin/chat/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Send failed");
      await fetchMessages(selected);
      fetchConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => (m.id ?? m._id) !== tempId));
      setInput(content);
      setReplyError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!selected || !selectedConv) return;
    const newStatus = selectedConv.status === "open" ? "closed" : "open";
    try {
      const res = await authFetch(`/api/admin/chat/${selected}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSelectedConv((prev) => prev ? { ...prev, status: newStatus } : prev);
        setConversations((prev) =>
          prev.map((c) => (String(c.id ?? c._id) === String(selected) ? { ...c, status: newStatus } : c))
        );
      }
    } catch (e) {
      console.error("toggleStatus error:", e);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByAdmin ?? 0), 0);

  const chatHeight = isDesktop ? "100vh" : "calc(100vh - 56px - 72px)";

  const ConversationList = (
    <div style={{
      width: isDesktop ? 300 : "100%",
      flexShrink: 0,
      borderRight: isDesktop ? "0.5px solid rgba(0,0,0,0.08)" : "none",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      height: isDesktop ? "100%" : chatHeight,
    }}>
      <div style={{ padding: "24px 20px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 6 }}>Live Chat</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 26, fontWeight: 300, color: "#0a0a0a" }}>Inbox</div>
          {totalUnread > 0 && (
            <div style={{ background: "#c9a96e", color: "#0a0a0a", borderRadius: 100, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
              {totalUnread}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {loadingConvs ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 64, background: "#ece9e3", borderRadius: 4 }} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#8a8680" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, marginBottom: 6 }}>No conversations yet</div>
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>Customer chats will appear here.</p>
          </div>
        ) : (
          conversations.map((conv, idx) => {
            const convId = String(conv.id ?? conv._id ?? `conv-${idx}`);
            return (
              <button
                key={convId}
                onClick={() => selectConversation(convId)}
                style={{
                  width: "100%", textAlign: "left",
                  background: selected === convId ? "#fafaf8" : "transparent",
                  border: "none",
                  borderLeft: selected === convId ? "2px solid #c9a96e" : "2px solid transparent",
                  borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                  padding: "14px 18px", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {conv.unreadByAdmin > 0 && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9a96e", flexShrink: 0 }} />
                      )}
                      <div style={{ fontSize: 13, fontWeight: conv.unreadByAdmin > 0 ? 600 : 400, color: "#0a0a0a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {conv.customerName}
                      </div>
                      <div style={{
                        fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
                        padding: "1px 6px", borderRadius: 100,
                        color: conv.status === "open" ? "#065f46" : "#6b7280",
                        background: conv.status === "open" ? "#d1fae5" : "#f3f4f6",
                        flexShrink: 0,
                      }}>
                        {conv.status}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#8a8680", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {conv.lastMessage || "No messages yet"}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#b0a99f", flexShrink: 0, paddingTop: 2 }}>
                    {new Date(conv.lastMessageAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const ChatPanel = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafaf8" }}>
      {!selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8a8680" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.2" style={{ marginBottom: 16 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#0a0a0a", marginBottom: 8 }}>Select a conversation</div>
          <p style={{ fontSize: 13 }}>Choose a chat from the inbox to respond.</p>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div style={{
            background: "#fff", padding: "14px 20px",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              {!isDesktop && (
                <button
                  onClick={() => { setMobileView("list"); setSelected(null); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8680", padding: "4px", flexShrink: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#0a0a0a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedConv?.customerName ?? "…"}
                </div>
                {selectedConv?.customerEmail && (
                  <div style={{ fontSize: 12, color: "#8a8680", marginTop: 2 }}>{selectedConv.customerEmail}</div>
                )}
              </div>
            </div>
            <button
              onClick={toggleStatus}
              style={{
                border: "0.5px solid rgba(0,0,0,0.15)", background: "transparent",
                padding: "7px 12px", fontSize: 11, letterSpacing: "0.08em",
                textTransform: "uppercase", cursor: "pointer",
                color: selectedConv?.status === "open" ? "#065f46" : "#6b7280",
                fontFamily: "DM Sans, sans-serif", flexShrink: 0,
              }}
            >
              {selectedConv?.status === "open" ? "Close" : "Reopen"}
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#8a8680", fontSize: 13, paddingTop: 40 }}>
                No messages yet. The customer will message here.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={msg.id ?? msg._id ?? `admin-msg-${idx}-${msg.createdAt}`} style={{ display: "flex", justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "68%", padding: "10px 14px",
                  background: msg.sender === "admin" ? "#0a0a0a" : "#fff",
                  color: msg.sender === "admin" ? "#fafaf8" : "#0a0a0a",
                  fontSize: 13, lineHeight: 1.6,
                  border: msg.sender === "customer" ? "0.5px solid rgba(0,0,0,0.1)" : "none",
                  borderRadius: msg.sender === "admin" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: 10, opacity: 0.55, marginBottom: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {msg.sender === "admin" ? "You" : selectedConv?.customerName}
                  </div>
                  {msg.content}
                  <div style={{ fontSize: 10, marginTop: 6, opacity: 0.45, textAlign: "right" }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          {replyError && (
            <div style={{ padding: "6px 16px", background: "#fff0f0", fontSize: 11, color: "#b91c1c", borderTop: "0.5px solid rgba(185,28,28,0.15)" }}>
              {replyError}
            </div>
          )}
          {selectedConv?.status === "open" ? (
            <div style={{
              background: "#fff", borderTop: "0.5px solid rgba(0,0,0,0.08)",
              padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-end",
            }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder="Type a reply… (Enter to send)"
                rows={2}
                style={{
                  flex: 1, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 2,
                  padding: "10px 12px", fontSize: 13, resize: "none", outline: "none",
                  fontFamily: "DM Sans, sans-serif", lineHeight: 1.5,
                }}
              />
              <button
                onClick={sendReply}
                disabled={!input.trim() || sending}
                style={{
                  background: input.trim() && !sending ? "#c9a96e" : "#e5e5e5",
                  border: "none", padding: "10px 20px",
                  fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: input.trim() && !sending ? "pointer" : "default",
                  color: "#0a0a0a", fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.2s", flexShrink: 0, height: 44,
                }}
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          ) : (
            <div style={{
              background: "#fff", borderTop: "0.5px solid rgba(0,0,0,0.08)",
              padding: "14px 20px", textAlign: "center", fontSize: 12, color: "#8a8680",
            }}>
              This conversation is closed. Reopen it to reply.
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        display: "flex",
        height: chatHeight,
        overflow: "hidden",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {isDesktop ? (
        <>
          {ConversationList}
          {ChatPanel}
        </>
      ) : (
        <AnimatePresence mode="wait">
          {mobileView === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
            >
              {ConversationList}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
            >
              {ChatPanel}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
