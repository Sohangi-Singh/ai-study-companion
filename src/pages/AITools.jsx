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
    if (mode === "quiz") return ""; // prompt handled in aiService for quiz mode
    if (mode === "explain") return `Explain "${topic}" in very simple terms as if explaining to a complete beginner with no technical background. Use analogies and simple examples. Keep it engaging.`;
    if (mode === "flashcards") return `Create 6 flashcards for the topic "${topic}". Format each as:\nCard N:\nFront: [question or term]\nBack: [answer or definition]\n\nMake them concise and exam-focused.`;
    return "";
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic");
    try {
      setLoading(true);
      setResult("");
      let res;
      if (mode === "quiz") {
        res = await generateAI("", { mode: "quiz", topic });
      } else {
        res = await generateAI(getPrompt());
      }
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

  // Parse quiz JSON (for quiz mode)
  let quizQuestions = [];
  if (mode === "quiz" && result) {
    try {
      // Remove any non-JSON text (Gemini sometimes adds extra text)
      const jsonStart = result.indexOf("[");
      const jsonEnd = result.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = result.slice(jsonStart, jsonEnd + 1);
        quizQuestions = JSON.parse(jsonString);
      }
    } catch (e) {
      // fallback: show error or nothing
      quizQuestions = [];
    }
  }

  // Quiz state
  const [quizState, setQuizState] = useState({
    current: 0,
    selected: {},
    showResult: false,
    score: 0
  });

  const handleQuizOption = (qIdx, optIdx) => {
    setQuizState((prev) => {
      const newSelected = { ...prev.selected, [qIdx]: optIdx };
      // Do not update score here; score will be calculated on submit
      return { ...prev, selected: newSelected };
    });
  };

  const handleQuizSubmit = () => {
    // Calculate score based on selected answers
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizState.selected[idx] === q.answer) score++;
    });
    setQuizState((prev) => ({ ...prev, showResult: true, score }));
  };

  const handleQuizRestart = () => {
    setQuizState({ current: 0, selected: {}, showResult: false, score: 0 });
  };

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
            ) : mode === "quiz" && quizQuestions.length > 0 ? (
              <div className="card">
                <h3 style={{ marginBottom: 16 }}>🧠 Interactive Quiz</h3>
                {quizState.showResult ? (
                  <div>
                    <div style={{ marginBottom: 16, fontWeight: 600 }}>
                      Score: {quizState.score} / {quizQuestions.length}
                    </div>
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} style={{ marginBottom: 18 }}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>{idx + 1}. {q.question}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.answer;
                            const isSelected = quizState.selected[idx] === oIdx;
                            return (
                              <div key={oIdx} style={{
                                padding: "7px 12px", borderRadius: 8,
                                background: isSelected ? (isCorrect ? "#dcfce7" : "#fee2e2") : "var(--surface2)",
                                color: isSelected ? (isCorrect ? "#16a34a" : "#dc2626") : "inherit",
                                border: isCorrect && quizState.selected[idx] !== undefined ? "1.5px solid #16a34a" : "1px solid var(--border)",
                                fontWeight: isSelected ? 600 : 400,
                                cursor: "default"
                              }}>
                                {opt} {isCorrect && quizState.selected[idx] !== undefined ? "✔️" : ""}
                                {isSelected && !isCorrect ? "❌" : ""}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-primary" onClick={handleQuizRestart}>Restart Quiz</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 500, marginBottom: 8 }}>
                        Question {quizState.current + 1} of {quizQuestions.length}
                      </div>
                      <div style={{ marginBottom: 10 }}>{quizQuestions[quizState.current].question}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {quizQuestions[quizState.current].options.map((opt, oIdx) => {
                          const isSelected = quizState.selected[quizState.current] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              className={"btn btn-outline" + (isSelected ? " btn-primary" : "")}
                              style={{ textAlign: "left", fontWeight: isSelected ? 600 : 400 }}
                              onClick={() => handleQuizOption(quizState.current, oIdx)}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {quizState.current < quizQuestions.length - 1 && (
                        <button
                          className="btn btn-primary"
                          onClick={() => setQuizState(prev => ({ ...prev, current: prev.current + 1 }))}
                          disabled={quizState.selected[quizState.current] === undefined}
                        >
                          Next
                        </button>
                      )}
                      {quizState.current === quizQuestions.length - 1 && (
                        <button
                          className="btn btn-success"
                          onClick={handleQuizSubmit}
                          disabled={quizState.selected[quizState.current] === undefined}
                        >
                          Submit
                        </button>
                      )}
                      {quizState.current > 0 && (
                        <button
                          className="btn btn-outline"
                          onClick={() => setQuizState(prev => ({ ...prev, current: prev.current - 1 }))}
                        >
                          Previous
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : mode === "explain" && result ? (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3>💡 Simple Explanation</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied!");
                  }}>📋 Copy</button>
                </div>
                {/* Try to format Gemini's output: split into paragraphs and bullets if possible */}
                <div style={{ lineHeight: 1.7, fontSize: "0.98rem", color: "var(--text)", fontFamily: "inherit" }}>
                  {(() => {
                    // Remove markdown symbols and format visually
                    let text = result
                      .replace(/^\s*#+\s?/gm, "") // Remove headings (#)
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                      .replace(/\n{2,}/g, '\n') // Remove extra newlines
                      .replace(/^-{2,}$/gm, '') // Remove horizontal rules
                      .replace(/\s*---+\s*/g, '') // Remove ---
                      .replace(/\n\s*\n/g, '\n');

                    // Split into lines and process for lists and paragraphs
                    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
                    const bulletRegex = /^[-*•]\s+/;
                    const numberedRegex = /^\d+\.\s+/;
                    let inList = false;
                    let listType = null;
                    let elements = [];
                    let listItems = [];
                    lines.forEach((line, idx) => {
                      if (bulletRegex.test(line)) {
                        if (!inList) { inList = true; listType = 'ul'; }
                        listItems.push(line.replace(bulletRegex, ""));
                      } else if (numberedRegex.test(line)) {
                        if (!inList) { inList = true; listType = 'ol'; }
                        listItems.push(line.replace(numberedRegex, ""));
                      } else {
                        if (inList) {
                          elements.push(listType === 'ul'
                            ? <ul key={idx}>{listItems.map((li, i) => <li key={i} dangerouslySetInnerHTML={{__html:li}} />)}</ul>
                            : <ol key={idx}>{listItems.map((li, i) => <li key={i} dangerouslySetInnerHTML={{__html:li}} />)}</ol>
                          );
                          listItems = [];
                          inList = false;
                          listType = null;
                        }
                        // Headings: treat lines with 'Part' or ':' or all-caps as headings
                        if (/^\s*(part|section|step|why|what|how|examples?)[:\s]/i.test(line) || (line.length < 50 && /[A-Z][A-Z\s]+/.test(line))) {
                          elements.push(<div key={idx} style={{ fontWeight: 700, fontSize: '1.1em', marginTop: 18, marginBottom: 6 }}>{line.replace(/:$/,"")}</div>);
                        } else {
                          elements.push(<div key={idx} style={{ marginBottom: 6 }} dangerouslySetInnerHTML={{__html:line}} />);
                        }
                      }
                    });
                    if (inList && listItems.length > 0) {
                      elements.push(listType === 'ul'
                        ? <ul key={lines.length}>{listItems.map((li, i) => <li key={i} dangerouslySetInnerHTML={{__html:li}} />)}</ul>
                        : <ol key={lines.length}>{listItems.map((li, i) => <li key={i} dangerouslySetInnerHTML={{__html:li}} />)}</ol>
                      );
                    }
                    return elements;
                  })()}
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