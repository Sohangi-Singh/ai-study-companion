import { useContext, useState } from "react";
import { StudyContext } from "../context/StudyContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, parseISO, addDays } from "date-fns";
import { toast } from "react-toastify";

function Revision() {
  const { subjects, setSubjects } = useContext(StudyContext);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Build revision schedule from completed topics
  const revisionItems = subjects.flatMap((s) =>
    (s.topics || [])
      .filter((t) => t.completedAt)
      .map((t) => {
        const completedDate = parseISO(t.completedAt);
        const revisionDate = addDays(completedDate, 3);
        return {
          ...t,
          subjectName: s.name,
          subjectId: s.id,
          subjectColor: s.color,
          revisionDate,
          revisionDateStr: format(revisionDate, "yyyy-MM-dd"),
        };
      })
  );

  // Topics due on selected calendar date
  const selectedStr = format(selectedDate, "yyyy-MM-dd");
  const dueToday = revisionItems.filter((t) => t.revisionDateStr === selectedStr);

  // All overdue (revision date passed, status not revised)
  const overdue = revisionItems.filter((t) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return t.revisionDate < today && t.status !== "Revised";
  });

  // Upcoming in next 7 days
  const upcoming = revisionItems.filter((t) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7 = addDays(today, 7);
    return t.revisionDate >= today && t.revisionDate <= in7;
  });

  // Dates that have revision due (for calendar dot markers)
  const revisionDates = new Set(revisionItems.map((t) => t.revisionDateStr));

  const markRevised = (subjectId, topicId) => {
    const updated = subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        topics: s.topics.map((t) =>
          t.id === topicId ? { ...t, status: "Revised" } : t
        ),
      };
    });
    setSubjects(updated);
    toast.success("Marked as revised! ✅");
  };

  const tileContent = ({ date }) => {
    const str = format(date, "yyyy-MM-dd");
    if (revisionDates.has(str)) {
      return <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", margin: "2px auto 0" }} />;
    }
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔁 Revision Planner</h1>
        <p>Spaced repetition — topics auto-scheduled 3 days after completion</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start" }}>
        {/* Calendar */}
        <div className="card" style={{ width: "fit-content" }}>
          <h3 style={{ marginBottom: 16 }}>📅 Revision Calendar</h3>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
          {dueToday.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Due on {format(selectedDate, "dd MMM")}:</p>
              {dueToday.map((t) => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: "1px solid var(--border)", gap: 8
                }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.subjectName}</div>
                  </div>
                  {t.status !== "Revised" && (
                    <button className="btn btn-success btn-sm" onClick={() => markRevised(t.subjectId, t.id)}>✓</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Overdue Revisions */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>⚠️ Overdue Revisions ({overdue.length})</h3>
            {overdue.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No overdue revisions. You're on track! 🎉</p>
            ) : (
              overdue.map((t) => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.subjectColor }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {t.subjectName} · Was due {format(t.revisionDate, "dd MMM")}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => markRevised(t.subjectId, t.id)}>
                    Mark Revised
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Revisions */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>📆 Upcoming (Next 7 Days)</h3>
            {upcoming.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No upcoming revisions. Complete some topics first!</p>
            ) : (
              upcoming.map((t) => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.subjectColor }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {t.subjectName} · Due {format(t.revisionDate, "dd MMM")}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-blue">
                    {format(t.revisionDate, "dd MMM")}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* All topics needing revision */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>🎯 All Weak Topics</h3>
            {subjects.every(s => !(s.topics || []).some(t => t.status === "Needs Revision")) ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No weak topics flagged.</p>
            ) : (
              subjects.flatMap(s =>
                (s.topics || [])
                  .filter(t => t.status === "Needs Revision")
                  .map(t => (
                    <div key={t.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderBottom: "1px solid var(--border)"
                    }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{t.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.name}</div>
                      </div>
                      <button className="btn btn-success btn-sm" onClick={() => markRevised(s.id, t.id)}>
                        Mark Revised
                      </button>
                    </div>
                  ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Revision;