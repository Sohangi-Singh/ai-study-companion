import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import useSubjects from "../hooks/useSubjects";
import { statusColor } from "../utils/helpers";

const COLORS = ["#6366f1","#06b6d4","#22c55e","#f59e0b","#ef4444","#8b5cf6","#ec4899"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Not Started", "In Progress", "Completed", "Needs Revision"];

function Subjects() {
  const { subjects, addSubject, deleteSubject, addTopic, updateTopicStatus, deleteTopic } = useSubjects();

  // subject form state
  const [subName, setSubName] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subColor, setSubColor] = useState("#6366f1");
  const [showSubForm, setShowSubForm] = useState(false);

  // topic form state (per subject)
  const [expandedId, setExpandedId] = useState(null);
  const [topicForms, setTopicForms] = useState({});

  const handleAddSubject = () => {
    addSubject(subName, subDesc, subColor);
    setSubName(""); setSubDesc(""); setSubColor("#6366f1");
    setShowSubForm(false);
  };

  const getTopicForm = (id) => topicForms[id] || { name: "", difficulty: "Medium", notes: "" };

  const setTopicForm = (id, val) => setTopicForms((prev) => ({ ...prev, [id]: val }));

  const handleAddTopic = (subjectId) => {
    addTopic(subjectId, getTopicForm(subjectId));
    setTopicForms((prev) => ({ ...prev, [subjectId]: { name: "", difficulty: "Medium", notes: "" } }));
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>📚 Subjects</h1>
          <p>Manage your subjects and topics</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSubForm(!showSubForm)}>
          + Add Subject
        </button>
      </div>

      {/* Add Subject Form */}
      <AnimatePresence>
        {showSubForm && (
          <motion.div
            className="card"
            style={{ marginBottom: 24 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 style={{ marginBottom: 16 }}>New Subject</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="input"
                placeholder="Subject name (e.g. Data Structures)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Description (optional)"
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
              />
              <div>
                <p style={{ fontSize: "0.85rem", marginBottom: 8, color: "var(--text-muted)" }}>Pick a color:</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setSubColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                        border: subColor === c ? "3px solid var(--text)" : "3px solid transparent"
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={handleAddSubject}>Add Subject</button>
                <button className="btn btn-outline" onClick={() => setShowSubForm(false)}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {subjects.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem" }}>📚</div>
          <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No subjects yet. Add your first subject!</p>
        </div>
      )}

      {/* Subjects List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {subjects.map((subject) => {
          const isOpen = expandedId === subject.id;
          const topics = subject.topics || [];
          const completed = topics.filter(t => t.status === "Completed").length;
          const tf = getTopicForm(subject.id);

          return (
            <motion.div
              key={subject.id}
              className="card"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Subject Header */}
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setExpandedId(isOpen ? null : subject.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: subject.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "1rem" }}>{subject.name}</div>
                    {subject.description && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{subject.description}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {completed}/{topics.length} topics done
                  </span>
                  {topics.length > 0 && (
                    <div style={{ width: 80 }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${topics.length === 0 ? 0 : Math.round((completed / topics.length) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                  >🗑️</button>
                  <span style={{ color: "var(--text-muted)" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Topics Section */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>

                      {/* Add Topic Form */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        <input
                          className="input"
                          style={{ flex: 2, minWidth: 160 }}
                          placeholder="Topic name"
                          value={tf.name}
                          onChange={(e) => setTopicForm(subject.id, { ...tf, name: e.target.value })}
                        />
                        <select
                          className="input"
                          style={{ flex: 1, minWidth: 100 }}
                          value={tf.difficulty}
                          onChange={(e) => setTopicForm(subject.id, { ...tf, difficulty: e.target.value })}
                        >
                          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                        </select>
                        <input
                          className="input"
                          style={{ flex: 2, minWidth: 160 }}
                          placeholder="Notes (optional)"
                          value={tf.notes}
                          onChange={(e) => setTopicForm(subject.id, { ...tf, notes: e.target.value })}
                        />
                        <button className="btn btn-primary" onClick={() => handleAddTopic(subject.id)}>
                          + Topic
                        </button>
                      </div>

                      {/* Topics List */}
                      {topics.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No topics yet. Add one above.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {topics.map((topic) => (
                            <div
                              key={topic.id}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 14px", background: "var(--surface2)",
                                borderRadius: 8, flexWrap: "wrap", gap: 8
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontWeight: 500 }}>{topic.name}</span>
                                <span className={`badge ${topic.difficulty === "Hard" ? "badge-red" : topic.difficulty === "Easy" ? "badge-green" : "badge-yellow"}`}>
                                  {topic.difficulty}
                                </span>
                                {topic.notes && (
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>📝 {topic.notes}</span>
                                )}
                                {(topic.attempts || 0) >= 2 && (
                                  <span className="badge badge-red">⚠️ Weak Topic</span>
                                )}
                              </div>

                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <select
                                  className="input"
                                  style={{ width: "auto", fontSize: "0.8rem", padding: "4px 8px" }}
                                  value={topic.status}
                                  onChange={(e) => updateTopicStatus(subject.id, topic.id, e.target.value)}
                                >
                                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <span className={`badge ${statusColor(topic.status)}`}>{topic.status}</span>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteTopic(subject.id, topic.id)}
                                >🗑️</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Subjects;