import { useContext, useState, useMemo } from "react";
import { StudyContext } from "../context/StudyContextObject";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, parseISO, addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiRefreshCw } from "react-icons/fi";

const MotionDiv = motion.div;
const EMPTY = { subjectId: "", topicId: "", topicName: "" };

function Revision() {
  const {
    subjects, setSubjects,
    customRevisions, addCustomRevision, markCustomRevised, deleteCustomRevision,
  } = useContext(StudyContext);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = format(today, "yyyy-MM-dd");
  const selectedStr = format(selectedDate, "yyyy-MM-dd");

  // ── Auto-scheduled revisions (3 days after completion) ──────────────────
  const autoItems = useMemo(() =>
    subjects.flatMap((s) =>
      (s.topics || [])
        .filter((t) => t.completedAt && t.status !== "Revised")
        .map((t) => {
          const revisionDate = startOfDay(addDays(parseISO(t.completedAt), 3));
          const revisionDateStr = format(revisionDate, "yyyy-MM-dd");
          const daysUntil = differenceInCalendarDays(revisionDate, today);
          return {
            ...t,
            subjectName: s.name,
            subjectId: s.id,
            subjectColor: s.color,
            revisionDate,
            revisionDateStr,
            daysUntil,
            isOverdue: daysUntil < 0,
            isDueToday: daysUntil === 0,
            isCustom: false,
          };
        })
    ),
    [subjects, today]
  );

  // ── Manual / custom revisions ────────────────────────────────────────────
  const customItems = useMemo(() =>
    customRevisions
      .filter((r) => r.status !== "revised")
      .map((r) => {
        const revisionDate = startOfDay(parseISO(r.dueDate));
        const daysUntil = differenceInCalendarDays(revisionDate, today);
        return {
          id: r.id,
          name: r.topicName,
          subjectName: r.subjectName,
          subjectId: r.subjectId,
          subjectColor: r.subjectColor,
          revisionDate,
          revisionDateStr: r.dueDate,
          daysUntil,
          isOverdue: daysUntil < 0,
          isDueToday: daysUntil === 0,
          status: "pending",
          isCustom: true,
        };
      }),
    [customRevisions, today]
  );

  const allItems = useMemo(() => [...autoItems, ...customItems], [autoItems, customItems]);

  // ── Derived lists ────────────────────────────────────────────────────────
  const dueOnSelected = allItems.filter((t) => t.revisionDateStr === selectedStr);
  const dueToday      = allItems.filter((t) => t.isDueToday);
  const overdue       = useMemo(() => allItems.filter((t) => t.isOverdue).sort((a, b) => a.daysUntil - b.daysUntil), [allItems]);
  const upcoming      = useMemo(() => allItems.filter((t) => t.daysUntil > 0 && t.daysUntil <= 7).sort((a, b) => a.daysUntil - b.daysUntil), [allItems]);
  const weakTopics    = useMemo(() =>
    subjects.flatMap((s) =>
      (s.topics || [])
        .filter((t) => t.status === "Needs Revision")
        .map((t) => ({ ...t, subjectId: s.id, subjectName: s.name, subjectColor: s.color, isCustom: false }))
    ),
    [subjects]
  );

  // ── Calendar tile helpers ────────────────────────────────────────────────
  const dateColorMap = useMemo(() => {
    const map = {};
    allItems.forEach((t) => {
      if (!map[t.revisionDateStr]) map[t.revisionDateStr] = new Set();
      map[t.revisionDateStr].add(t.subjectColor || "#6366f1");
    });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
  }, [allItems]);

  const overdueDateSet = useMemo(() => new Set(overdue.map((t) => t.revisionDateStr)), [overdue]);

  const tileContent = ({ date }) => {
    const str = format(date, "yyyy-MM-dd");
    const colors = dateColorMap[str];
    if (!colors?.length) return null;
    return (
      <div className="calendar-dots">
        {colors.slice(0, 4).map((color, i) => (
          <div key={i} className="calendar-dot" style={{ background: color }} />
        ))}
      </div>
    );
  };

  const tileClassName = ({ date }) => {
    const str = format(date, "yyyy-MM-dd");
    if (overdueDateSet.has(str)) return "tile-overdue";
    if (str === todayStr && dateColorMap[str]) return "tile-today-has-revision";
    if (dateColorMap[str]) return "tile-has-revision";
    return null;
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const markRevised = (item) => {
    if (item.isCustom) {
      markCustomRevised(item.id);
    } else {
      setSubjects(
        subjects.map((s) =>
          s.id !== item.subjectId
            ? s
            : { ...s, topics: s.topics.map((t) => t.id === item.id ? { ...t, status: "Revised", revisedAt: new Date().toISOString() } : t) }
        )
      );
    }
    toast.success("Marked as revised! 🎉");
  };

  const removeCustom = (id) => {
    deleteCustomRevision(id);
    toast.info("Revision removed");
  };

  // ── Add-form helpers ─────────────────────────────────────────────────────
  const selectedSubject = subjects.find((s) => s.id === addForm.subjectId);
  const subjectTopics   = selectedSubject?.topics || [];

  const handleSubjectChange = (subjectId) => {
    setAddForm({ subjectId, topicId: "", topicName: "" });
  };

  const handleTopicChange = (topicId) => {
    if (topicId === "custom") {
      setAddForm((f) => ({ ...f, topicId: "custom", topicName: "" }));
    } else {
      const topic = subjectTopics.find((t) => t.id === topicId);
      setAddForm((f) => ({ ...f, topicId, topicName: topic?.name || "" }));
    }
  };

  const handleAddRevision = () => {
    if (!addForm.subjectId) { toast.error("Please select a subject"); return; }
    const topicName = addForm.topicId === "custom"
      ? addForm.topicName.trim()
      : (subjectTopics.find((t) => t.id === addForm.topicId)?.name || addForm.topicName.trim());
    if (!topicName) { toast.error("Please select or enter a topic name"); return; }

    addCustomRevision({
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      subjectColor: selectedSubject.color,
      topicId: addForm.topicId !== "custom" ? addForm.topicId : null,
      topicName,
      dueDate: selectedStr,
    });
    setShowAddForm(false);
    setAddForm(EMPTY);
    toast.success(`Revision scheduled for ${format(selectedDate, "MMM d")} 📅`);
  };

  const openAddForm = () => {
    setAddForm(EMPTY);
    setShowAddForm(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowAddForm(false);
    setAddForm(EMPTY);
  };

  // ── Tab config ───────────────────────────────────────────────────────────
  const tabs = [
    { id: "today",    label: "Due Today",   count: dueToday.length,   variant: dueToday.length > 0 ? "danger" : "" },
    { id: "overdue",  label: "Overdue",     count: overdue.length,    variant: overdue.length > 0 ? "danger" : "" },
    { id: "upcoming", label: "Upcoming",    count: upcoming.length,   variant: "" },
    { id: "weak",     label: "Weak Topics", count: weakTopics.length, variant: weakTopics.length > 0 ? "warning" : "" },
  ];

  const tabListMap = { today: dueToday, overdue, upcoming, weak: weakTopics };

  const hintMap = {
    today:    dueToday.length > 0    ? { text: `${dueToday.length} topic${dueToday.length > 1 ? "s" : ""} due for revision today`, variant: "info" } : null,
    overdue:  overdue.length > 0     ? { text: `${overdue.length} topic${overdue.length > 1 ? "s" : ""} past their revision date — catch up when you can`, variant: "danger" } : null,
    upcoming: upcoming.length > 0    ? { text: "Stay ahead — revise before the due date to strengthen memory", variant: "info" } : null,
    weak:     weakTopics.length > 0  ? { text: "Topics flagged as weak — revisit to build confidence", variant: "warning" } : null,
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 className="page-title">
            <FiRefreshCw className="page-title-icon" aria-hidden="true" />
            <span className="page-title-text">Revision Planner</span>
          </h1>
          {(overdue.length + dueToday.length) > 0 && (
            <span className="badge badge-red">{overdue.length + dueToday.length} pending</span>
          )}
        </div>
        <p>Spaced repetition · Topics auto-scheduled 3 days after completion · Click any date to add a manual revision</p>
      </div>

      <div className="revision-layout">
        {/* ── Left column: Calendar + date panel ───────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Calendar card */}
          <div className="card revision-calendar-card">
            <div className="revision-calendar-header">
              <h3 className="section-title section-title-compact">
                <FiCalendar className="section-title-icon" aria-hidden="true" />
                <span>Revision Calendar</span>
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => handleDateChange(new Date())}>
                Today
              </button>
            </div>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-dot legend-dot-overdue" />
                <span>Overdue</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--primary)" }} />
                <span>Scheduled</span>
              </div>
              <div className="legend-item">
                <div style={{ display: "flex", gap: 2 }}>
                  <div className="legend-dot" style={{ background: "#6366f1" }} />
                  <div className="legend-dot" style={{ background: "#f59e0b" }} />
                </div>
                <span>Multiple subjects</span>
              </div>
            </div>
          </div>

          {/* Selected-date panel */}
          <AnimatePresence mode="wait">
            <MotionDiv
              key={selectedStr}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="card date-panel"
            >
              {/* Date panel header */}
              <div className="date-panel-header">
                <div>
                  <div className="date-panel-title">
                    {selectedStr === todayStr ? "Today" : format(selectedDate, "MMMM d, yyyy")}
                  </div>
                  <div className="date-panel-sub">
                    {dueOnSelected.length === 0 ? "No revisions" : `${dueOnSelected.length} revision${dueOnSelected.length > 1 ? "s" : ""}`}
                  </div>
                </div>
                <button
                  className={`btn btn-sm ${showAddForm ? "btn-outline" : "btn-primary"}`}
                  onClick={() => showAddForm ? setShowAddForm(false) : openAddForm()}
                >
                  {showAddForm ? "✕ Cancel" : "+ Add"}
                </button>
              </div>

              {/* Add-revision inline form */}
              <AnimatePresence>
                {showAddForm && (
                  <MotionDiv
                    key="add-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="add-form-body">
                      <div className="add-form-label">Add revision for {format(selectedDate, "MMM d, yyyy")}</div>

                      {/* Subject select */}
                      <select
                        className="input"
                        value={addForm.subjectId}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                      >
                        <option value="">Select subject…</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>

                      {/* Topic select / input */}
                      {addForm.subjectId && (
                        <>
                          {subjectTopics.length > 0 ? (
                            <select
                              className="input"
                              value={addForm.topicId}
                              onChange={(e) => handleTopicChange(e.target.value)}
                            >
                              <option value="">Select topic…</option>
                              {subjectTopics.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                              <option value="custom">+ Custom topic name…</option>
                            </select>
                          ) : null}

                          {(addForm.topicId === "custom" || subjectTopics.length === 0) && (
                            <input
                              className="input"
                              placeholder="Enter topic name…"
                              value={addForm.topicName}
                              onChange={(e) => setAddForm((f) => ({ ...f, topicName: e.target.value }))}
                              autoFocus
                            />
                          )}
                        </>
                      )}

                      <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleAddRevision}>
                        Schedule Revision
                      </button>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>

              {/* Items due on selected date */}
              {dueOnSelected.length === 0 && !showAddForm && (
                <div className="date-panel-empty">
                  <span>No revisions on this date.</span>
                  <button className="date-panel-empty-cta" onClick={openAddForm}>
                    + Schedule one
                  </button>
                </div>
              )}

              {dueOnSelected.map((t) => (
                <RevisionItem
                  key={t.isCustom ? `c-${t.id}` : `a-${t.id}`}
                  topic={t}
                  onMark={markRevised}
                  onDelete={removeCustom}
                  compact
                />
              ))}
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* ── Right column: Tabbed lists ────────────────────── */}
        <div>
          <div className="tabs" style={{ flexWrap: "wrap", marginBottom: 16 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`tab-count ${tab.variant ? `tab-count-${tab.variant}` : ""}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <MotionDiv
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="card"
            >
              {tabListMap[activeTab].length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                <>
                  {hintMap[activeTab] && (
                    <div className={`revision-hint revision-hint-${hintMap[activeTab].variant}`}>
                      {hintMap[activeTab].text}
                    </div>
                  )}
                  <AnimatePresence>
                    {tabListMap[activeTab].map((t) => (
                      <RevisionItem
                        key={t.isCustom ? `c-${t.id}` : `a-${t.id}`}
                        topic={t}
                        onMark={markRevised}
                        onDelete={removeCustom}
                        activeTab={activeTab}
                      />
                    ))}
                  </AnimatePresence>
                </>
              )}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RevisionItem({ topic, onMark, onDelete, compact, activeTab }) {
  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={`revision-item ${compact ? "revision-item-compact" : ""}`}
      style={{ "--subject-color": topic.subjectColor || "#6366f1" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <div className="subject-dot" style={{ background: topic.subjectColor || "var(--primary)" }} />
        <div style={{ minWidth: 0 }}>
          <div className={compact ? "revision-item-name-sm" : "revision-item-name"}>
            {topic.name}
            {topic.isCustom && <span className="custom-badge">manual</span>}
          </div>
          <div className="revision-item-meta">
            {topic.subjectName}
            {activeTab === "overdue"  && topic.daysUntil !== undefined && ` · ${Math.abs(topic.daysUntil)}d overdue`}
            {activeTab === "upcoming" && topic.revisionDate             && ` · due ${format(topic.revisionDate, "MMM d")}`}
            {!activeTab && topic.revisionDate && ` · ${format(topic.revisionDate, "MMM d")}`}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {activeTab === "overdue" && topic.daysUntil !== undefined && (
          <span className="badge badge-red">{Math.abs(topic.daysUntil)}d late</span>
        )}
        {activeTab === "upcoming" && topic.daysUntil !== undefined && (
          <span className="badge badge-blue">
            {topic.daysUntil === 1 ? "Tomorrow" : `In ${topic.daysUntil}d`}
          </span>
        )}
        {topic.status !== "Revised" ? (
          <button className="btn btn-success btn-sm" onClick={() => onMark(topic)}>
            ✓ Revised
          </button>
        ) : (
          <span className="badge badge-green">Done</span>
        )}
        {topic.isCustom && (
          <button
            className="btn btn-sm"
            title="Remove"
            style={{ color: "var(--text-muted)", padding: "4px 6px" }}
            onClick={() => onDelete(topic.id)}
          >
            ✕
          </button>
        )}
      </div>
    </MotionDiv>
  );
}

function EmptyState({ tab }) {
  const states = {
    today:    { icon: "🎉", text: "Nothing due today — you're all caught up!" },
    overdue:  { icon: "✅", text: "No overdue revisions. You're on track!" },
    upcoming: { icon: "📚", text: "No upcoming revisions. Complete some topics to get started." },
    weak:     { icon: "🏆", text: "No weak topics flagged — keep it up!" },
  };
  const { icon, text } = states[tab] || { icon: "✅", text: "Nothing here." };
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-text">{text}</p>
    </div>
  );
}

export default Revision;
