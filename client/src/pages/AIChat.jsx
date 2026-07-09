import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuUpload, LuSend, LuFileText, LuLoader, LuMessageSquarePlus, LuTrash2 } from "react-icons/lu";
import DashboardLayout from "../components/DashboardLayout.jsx";
import ChatMessage from "../components/ChatMessage.jsx";
import api from "../api/axios.js";

export default function AIChat() {
  const [manuals, setManuals] = useState([]);
  const [selectedManualId, setSelectedManualId] = useState(""); // "" = search all manuals
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const loadManuals = async () => {
    try {
      const { data } = await api.get("/manuals");
      setManuals(data.manuals);
    } catch {
      toast.error("Couldn't load manuals");
    }
  };

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/chat");
      setConversations(data.conversations);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    loadManuals();
    loadConversations();

    // Poll manuals every 5s while any are still processing, to reflect ingestion status
    const interval = setInterval(() => {
      setManuals((current) => {
        if (current.some((m) => m.status === "processing")) loadManuals();
        return current;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("manual", file);
      formData.append("title", file.name.replace(/\.pdf$/i, ""));
      await api.post("/manuals/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Manual uploaded — processing in the background");
      loadManuals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const openConversation = async (id) => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      setActiveConversationId(id);
      setMessages(data.conversation.messages);
    } catch {
      toast.error("Couldn't load conversation");
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    await api.delete(`/chat/${id}`);
    if (activeConversationId === id) startNewConversation();
    loadConversations();
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    const readyManuals = manuals.filter((m) => m.status === "ready");
    if (readyManuals.length === 0) {
      toast.error("Upload and wait for at least one manual to finish processing first");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setAsking(true);

    try {
      const path = activeConversationId ? `/chat/${activeConversationId}` : "/chat";
      const { data } = await api.post(path, {
        question: q,
        manualId: selectedManualId || undefined,
      });
      setActiveConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
      loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setAsking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="vf-eyebrow mb-1">RAG assistant</p>
        <h1 className="font-display text-2xl font-semibold">AI Manual Assistant</h1>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left column: manuals + conversation list */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="vf-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Manuals</h3>
              <label className="cursor-pointer text-volt-500 hover:text-volt-400">
                <LuUpload size={16} />
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
              </label>
            </div>

            {uploading && (
              <p className="text-xs text-ink-muted flex items-center gap-1.5 mb-2">
                <LuLoader className="animate-spin" size={12} /> Uploading…
              </p>
            )}

            <div className="space-y-1 max-h-40 overflow-y-auto">
              <button
                onClick={() => setSelectedManualId("")}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 ${
                  selectedManualId === "" ? "bg-volt-500/10 text-volt-500" : "text-ink-muted hover:bg-white/5"
                }`}
              >
                <LuFileText size={13} /> All manuals
              </button>
              {manuals.map((m) => (
                <button
                  key={m._id}
                  onClick={() => setSelectedManualId(m._id)}
                  disabled={m.status !== "ready"}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between gap-2 disabled:opacity-50 ${
                    selectedManualId === m._id ? "bg-volt-500/10 text-volt-500" : "text-ink-muted hover:bg-white/5"
                  }`}
                >
                  <span className="truncate flex items-center gap-2">
                    <LuFileText size={13} className="shrink-0" /> {m.title}
                  </span>
                  {m.status === "processing" && <LuLoader className="animate-spin shrink-0" size={11} />}
                  {m.status === "failed" && <span className="text-danger shrink-0">✕</span>}
                </button>
              ))}
              {manuals.length === 0 && (
                <p className="text-xs text-ink-faint px-2.5 py-2">Upload a PDF manual to get started.</p>
              )}
            </div>
          </div>

          <div className="vf-card p-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Conversations</h3>
              <button onClick={startNewConversation} className="text-ink-muted hover:text-volt-500">
                <LuMessageSquarePlus size={16} />
              </button>
            </div>
            <div className="space-y-1 overflow-y-auto">
              {conversations.map((c) => (
                <div
                  key={c._id}
                  onClick={() => openConversation(c._id)}
                  className={`group px-2.5 py-2 rounded-md text-xs cursor-pointer flex items-center justify-between gap-2 ${
                    activeConversationId === c._id ? "bg-volt-500/10 text-volt-500" : "text-ink-muted hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{c.title}</span>
                  <button
                    onClick={(e) => deleteConversation(c._id, e)}
                    className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-danger shrink-0"
                  >
                    <LuTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: chat */}
        <div className="vf-card flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <LuFileText className="text-ink-faint mb-3" size={32} />
                <p className="text-ink-muted text-sm max-w-xs">
                  Ask anything from your uploaded manuals — e.g. "How do I recalibrate the torque sensor?"
                </p>
              </div>
            ) : (
              messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} sources={m.sources} />)
            )}
            {asking && (
              <div className="flex items-center gap-2 text-ink-muted text-sm pl-11">
                <LuLoader className="animate-spin" size={14} /> Thinking…
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="border-t border-white/5 p-4 flex items-center gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about your manual…"
              className="vf-input flex-1"
            />
            <button type="submit" disabled={asking || !question.trim()} className="vf-btn-primary shrink-0">
              <LuSend size={16} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
