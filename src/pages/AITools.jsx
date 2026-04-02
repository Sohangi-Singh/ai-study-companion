import { useState, useContext } from "react";
import { StudyContext } from "../context/StudyContext";
import { generateAI } from "../services/aiService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MODES = [
  { key: "quiz", label: "🧠 Quiz Me", desc: "Generate 5 MCQs on a topic" },
  { key: "explain", label: "💡 Explain Simply", desc: "Explain like I'm a beginner" },
  { key: "flashcards", label: "🃏 Flashcards", desc: "Key points as flashcards" },
];

function AITools() {
  const { subjects, setSubjects, logSession } = useContext(StudyContext);
  const [topic, setTopic] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [mode, setMode] = useState("quiz");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedTopics, setSavedTopics] = useState([]);

  const getPrompt = () => {
    if (mode === "quiz") return `Generate exactly 5 multiple choice questions with 4 options each and clearly mark the correct answer for the topic: "${topic}". Format each question clearly numbered.`;
    if (mode === "explain") return `Explain "${topic}" in very simple terms as if explaining to a complete beginner with no technical background. Use analogies and simple examples. Keep it engaging.`;
    if (mode === "flashcards") return `Create 6 flashcards for the topic "${topic}". Format each as:\nCard N:\nFront: [question or term]\nBack: [answer or definition]\n\nMake them concise and exam-focused.`;
    return "";
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic");
    try {
      setLoading(true);
      setResult("");
      const res = await generateAI(getPrompt());
      setResult(res);
      if (selectedSubject) logSession(selectedSubject);
      toast.success("Generated successfully!");
    } catch (err) {
      toast.error("Failed. Check API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForRevision = () => {
    if (!topic.trim()) return;
    if (savedTopics.includes(topic)) return toast.info("Already saved for revision");

    // Find subject and add topic marked for revision
    if (selectedSubject) {
      const updated = subjects.map((s) => {
        if (s.name !== selectedSubject) return s;
        const exists = (s.topics || []).find(t => t.name.toLowerCase() === topic.toLowerCase());
        if (exists) {
          return {
            ...s,
            topics: s.topics.map(t =>
              t.name.toLowerCase() === topic.toLowerCase()
                ? { ...t, status: "Needs Revision", attempts: (t.attempts || 0) + 1 }
                : t
            )
          };
        }
        return {
          ...s,
          topics: [...(s.topics || []), {
            id: Date.now().toString(),
            name: topic,
            difficulty: "Medium",
            status: "Needs Revision",
            notes: "Added via AI Tools",
            attempts: 1,
            createdAt: new Date().toISOString()
          }]
        };
      });
      setSubjects(updated);
    }

    setSavedTopics([...savedTopics, topic]);
    toast.success(`"${topic}" saved for revision!`);
  };

  // Parse flashcards from result
  const flashcards = mode === "flashcards" && result
    ? result.split(/Card \d+:/i).filter(Boolean).map(card => {
        const front = card.match(/Front:\s*(.+)/i)?.[1]?.trim() || "";
        const back = card.match(/Back:\s*(.+)/i)?.[1]?.trim() || "";
        return { front, back };
      }).filter(c => c.front)
    : [];

  const [flipped, setFlipped] = useState({});

  return (
    <div>
      <div className="page-header">
        <h1>🤖 AI Study Tools</h1>
        <p>Powered by Gemini AI — your personal study assistant</p>
      </div>

      {/* Mode Selector */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <div
            key={m.key}
            onClick={() => { setMode(m.key); setResult(""); }}
            style={{
              flex: 1, minWidth: 160, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: mode === m.key ? "var(--primary)" : "var(--surface)",
              color: mode === m.key ? "white" : "var(--text)",
              border: `1px solid ${mode === m.key ? "var(--primary)" : "var(--border)"}`,
              transition: "all 0.2s"
            }}
          >
            <div style={{ fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: "0.78rem", opacity: 0.8, marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 2, minWidth: 200 }}
            placeholder="Enter topic (e.g. Binary Trees, Photosynthesis)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <select
            className="input"
            style={{ flex: 1, minWidth: 160 }}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select subject (optional)</option>
            {subjects.map(s => <option key={s.id}>{s.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? "⏳ Generating..." : "Generate"}
          </button>
          {result && (
            <button className="btn btn-outline" onClick={handleSaveForRevision}>
              🔁 Test Me Again Later
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🤖</div>
          <p style={{ color: "var(--text-muted)" }}>AI is thinking...</p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Flashcard mode — special UI */}
            {mode === "flashcards" && flashcards.length > 0 ? (
              <div>
                <h3 style={{ marginBottom: 16 }}>🃏 Flashcards — click to flip</h3>
                <div className="card-grid">
                  {flashcards.map((card, i) => (
                    <div
                      key={i}
                      onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
                      style={{
                        padding: 24, borderRadius: 12, cursor: "pointer", minHeight: 120,
                        background: flipped[i] ? "var(--primary)" : "var(--surface)",
                        color: flipped[i] ? "white" : "var(--text)",
                        border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textAlign: "center", transition: "all 0.3s", fontSize: "0.9rem"
                      }}
                    >
                      {flipped[i] ? card.back : card.front}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3>{mode === "quiz" ? "🧠 Quiz Questions" : "💡 Simple Explanation"}</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied!");
                  }}>📋 Copy</button>
                </div>
                <pre style={{
                  whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: "0.9rem",
                  color: "var(--text)", fontFamily: "inherit"
                }}>
                  {result}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved for revision */}
      {savedTopics.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12 }}>🔁 Saved for Later Review</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {savedTopics.map((t) => (
              <span key={t} className="badge badge-purple">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AITools;