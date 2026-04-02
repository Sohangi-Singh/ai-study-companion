import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";
import useProgress from "../hooks/useProgress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COLORS } from "../utils/helpers";
import { Link } from "react-router-dom";

function Dashboard() {
  const { subjects, tasks, studySessions } = useContext(StudyContext);
  const {
    totalTopics, completedTopics, needsRevision,
    totalTasks, completedTasks, pendingTasks, overdueTasks,
    completionPercent, subjectProgress,
    bestDay, sessionsThisWeek
  } = useProgress();

  // weak topics across all subjects
  const weakTopics = subjects.flatMap(s =>
    (s.topics || [])
      .filter(t => (t.attempts || 0) >= 2 || t.status === "Needs Revision")
      .map(t => ({ ...t, subjectName: s.name }))
  );

  // upcoming revisions (topics completed, revision due in 3 days)
  const revisionDue = subjects.flatMap(s =>
    (s.topics || [])
      .filter(t => t.status === "Completed" && t.completedAt)
      .map(t => {
        const completedDate = new Date(t.completedAt);
        const revisionDate = new Date(completedDate);
        revisionDate.setDate(revisionDate.getDate() + 3);
        const daysLeft = Math.ceil((revisionDate - new Date()) / (1000 * 60 * 60 * 24));
        return { ...t, subjectName: s.name, daysLeft };
      })
      .filter(t => t.daysLeft <= 3 && t.daysLeft >= 0)
  );

  // productivity insights
  const insights = [];
  if (bestDay) insights.push({ icon: "📅", title: `You study most on ${bestDay}s`, desc: "Keep that momentum going!" });
  if (sessionsThisWeek === 0) insights.push({ icon: "⚠️", title: "No sessions this week", desc: "Try the AI Tools to get started!" });
  if (sessionsThisWeek >= 3) insights.push({ icon: "🔥", title: "Great consistency this week!", desc: `${sessionsThisWeek} sessions logged` });
  if (weakTopics.length > 0) insights.push({ icon: "🎯", title: `${weakTopics.length} weak topic(s) detected`, desc: "Head to Revision planner to fix them" });
  if (overdueTasks > 0) insights.push({ icon: "⏰", title: `${overdueTasks} overdue task(s)`, desc: "Check your Tasks page" });
  if (completionPercent >= 80) insights.push({ icon: "🏆", title: "Almost done!", desc: `${completionPercent}% of topics completed` });
  if (insights.length === 0) insights.push({ icon: "👋", title: "Welcome!", desc: "Add subjects and tasks to get started." });

  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Your study progress at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {[
          { label: "Total Topics", value: totalTopics, icon: "📚" },
          { label: "Completed", value: completedTopics, icon: "✅" },
          { label: "Needs Revision", value: needsRevision, icon: "🔁" },
          { label: "Total Tasks", value: totalTasks, icon: "📝" },
          { label: "Pending Tasks", value: pendingTasks, icon: "⏳" },
          { label: "Overdue", value: overdueTasks, icon: "⚠️" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div style={{ fontSize: "1.8rem" }}>{s.icon}</div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Overall Completion</span>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{completionPercent}%</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Subject Progress Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Subject Progress</h3>
          {subjectProgress.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No subjects yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectProgress}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
                  formatter={(val, name) => [val, name === "completed" ? "Completed" : "Total"]}
                />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                  {subjectProgress.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Productivity Insights */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>💡 Productivity Insights</h3>
          {insights.map((ins, i) => (
            <div className="insight" key={i}>
              <span className="insight-icon">{ins.icon}</span>
              <div className="insight-text">
                <strong>{ins.title}</strong>
                {ins.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Weak Topics */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>⚠️ Weak Topics</h3>
          {weakTopics.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No weak topics detected. Great job! 🎉</p>
          ) : (
            weakTopics.map((t) => (
              <div key={t.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.subjectName}</div>
                </div>
                <span className="badge badge-red">Needs Revision</span>
              </div>
            ))
          )}
          {weakTopics.length > 0 && (
            <Link to="/revision" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: "inline-block", textDecoration: "none" }}>
              Plan Revision →
            </Link>
          )}
        </div>

        {/* Revision Due Soon */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🔁 Revision Due Soon</h3>
          {revisionDue.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No revisions due soon.</p>
          ) : (
            revisionDue.map((t) => (
              <div key={t.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.subjectName}</div>
                </div>
                <span className={`badge ${t.daysLeft === 0 ? "badge-red" : "badge-yellow"}`}>
                  {t.daysLeft === 0 ? "Due today" : `In ${t.daysLeft}d`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;