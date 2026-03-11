// ChatWidget.jsx — Floating bottom-right chatbot widget
// Connects to /api/chat streaming endpoint, routes to all 3 agents via intent detection

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Minimize2,
    Maximize2,
    Loader2,
    Trash2,
    BrainCircuit
} from "lucide-react";
import "./ChatWidget.css";

const API_URL = "http://localhost:8000/api/chat";

// Simple markdown-like renderer for bold, bullets, numbered lists
function renderMarkdown(text) {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
        // bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        const trimmed = line.trim();
        if (trimmed.startsWith("- ")) {
            return <li key={i} className="cw-bullet">{parts.map((p, j) => (
                typeof p === "string"
                    ? p.replace(/^- /, "")
                    : p
            ))}</li>;
        }
        if (/^\d+\.\s/.test(trimmed)) {
            return <li key={i} className="cw-num">{parts}</li>;
        }
        if (trimmed === "") return <br key={i} />;
        return <p key={i} className="cw-p">{parts}</p>;
    });
}

const QUICK_PROMPTS = [
    "📄 Analyze my resume",
    "📈 Salary for Data Scientist",
    "🗺️ Roadmap to become ML Engineer",
    "💡 How to improve my ATS score?",
    "🔥 Top skills for 2025",
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "👋 Hi! I'm your **AI Career Assistant**.\n\nI can help you with:\n- 📄 Resume & ATS analysis\n- 📈 Market insights & salary data\n- 🗺️ Week-by-week learning roadmaps\n- 💬 General career guidance\n\nWhat would you like to explore today?",
            id: "welcome"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [showBadge, setShowBadge] = useState(true);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setShowBadge(false);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    const sendMessage = useCallback(async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || loading) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", text: trimmed, id: Date.now() }]);
        setLoading(true);

        // Placeholder for streaming assistant message
        const assistantId = Date.now() + 1;
        setMessages(prev => [...prev, { role: "assistant", text: "", id: assistantId, streaming: true }]);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    session_id: sessionId,
                }),
            });

            // Grab session ID from response header
            const sid = res.headers.get("X-Session-ID");
            if (sid) setSessionId(sid);

            if (!res.ok || !res.body) {
                throw new Error(`Server error: ${res.status}`);
            }

            // Stream reader
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulated += chunk;
                setMessages(prev =>
                    prev.map(m => m.id === assistantId ? { ...m, text: accumulated } : m)
                );
            }

            // Mark streaming done
            setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
            );

        } catch (err) {
            setMessages(prev =>
                prev.map(m => m.id === assistantId
                    ? { ...m, text: "⚠️ Something went wrong. Please try again.", streaming: false }
                    : m
                )
            );
        } finally {
            setLoading(false);
        }
    }, [input, loading, sessionId]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setSessionId(null);
        setMessages([{
            role: "assistant",
            text: "Chat cleared! What would you like to explore?",
            id: Date.now()
        }]);
    };

    return (
        <>
            {/* ─── FLOATING BUTTON ─── */}
            <button
                className={`cw-fab ${isOpen ? "cw-fab--open" : ""}`}
                onClick={() => setIsOpen(v => !v)}
                aria-label="Open AI Career Assistant"
            >
                {isOpen
                    ? <X size={22} />
                    : (
                        <>
                            <BrainCircuit size={22} />
                            {showBadge && <span className="cw-badge" />}
                        </>
                    )
                }
            </button>

            {/* ─── CHAT PANEL ─── */}
            {isOpen && (
                <div className={`cw-panel ${isExpanded ? "cw-panel--expanded" : ""}`}>

                    {/* Header */}
                    <div className="cw-header">
                        <div className="cw-header-left">
                            <div className="cw-avatar">
                                <Bot size={16} />
                            </div>
                            <div>
                                <p className="cw-name">AI Career Assistant</p>
                                <span className="cw-status">● Online</span>
                            </div>
                        </div>
                        <div className="cw-header-actions">
                            <button onClick={clearChat} title="Clear chat" className="cw-icon-btn">
                                <Trash2 size={15} />
                            </button>
                            <button
                                onClick={() => setIsExpanded(v => !v)}
                                title={isExpanded ? "Minimize" : "Expand"}
                                className="cw-icon-btn"
                            >
                                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="cw-icon-btn">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="cw-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`cw-msg cw-msg--${msg.role}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="cw-msg-avatar">
                                        <Bot size={13} />
                                    </div>
                                )}
                                <div className={`cw-bubble cw-bubble--${msg.role}`}>
                                    {renderMarkdown(msg.text)}
                                    {msg.streaming && msg.text.length === 0 && (
                                        <span className="cw-typing">
                                            <span /><span /><span />
                                        </span>
                                    )}
                                </div>
                                {msg.role === "user" && (
                                    <div className="cw-msg-avatar cw-msg-avatar--user">
                                        <User size={13} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && messages[messages.length - 1]?.role === "user" && (
                            <div className="cw-msg cw-msg--assistant">
                                <div className="cw-msg-avatar"><Bot size={13} /></div>
                                <div className="cw-bubble cw-bubble--assistant">
                                    <span className="cw-typing"><span /><span /><span /></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Prompts */}
                    {messages.length <= 2 && (
                        <div className="cw-quick-prompts">
                            {QUICK_PROMPTS.map((q, i) => (
                                <button key={i} className="cw-quick-btn" onClick={() => sendMessage(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="cw-input-row">
                        <textarea
                            ref={inputRef}
                            className="cw-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about your career…"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            className="cw-send-btn"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                        >
                            {loading
                                ? <Loader2 size={16} className="cw-send-spin" />
                                : <Send size={16} />
                            }
                        </button>
                    </div>

                    <p className="cw-footer">Powered by Gemini · Career AI</p>
                </div>
            )}
        </>
    );
}
