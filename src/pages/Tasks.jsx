import { useState } from "react";
import useTasks from "../hooks/useTasks";
import useSubjects from "../hooks/useSubjects";
import useDebounce from "../hooks/useDebounce";
import { formatDate, daysUntil, priorityColor } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["All", "Pending", "Completed", "Overdue", "Revision"];
const PRIORITIES = ["Low", "Medium", "High"];

function Tasks() {
  const { tasks, addTask, updateTaskStatus, deleteTask, filterTasks } = useTasks();
  const { subjects } = useSubjects();

  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "", subject: "", topic: "",
    deadline: "", priority: "Medium"
  });

  const debouncedSearch = useDebounce(search, 300);

  const handleAdd = () => {
    addTask(form);
    setForm({ title: "", subject: "", topic: "", deadline: "", priority: "Medium" });
    setShowForm(false);
  };

  const filtered = filterTasks(tab, debouncedSearch, {
    subject: filterSubject,
    priority: filterPriority
  }).sort((a, b) => {
    if (sortBy === "deadline") return (a.deadline || "z").localeCompare(b.deadline || "z");
    if (sortBy === "priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    }
    return b.createdAt?.localeCompare(a.createdAt || "");
  });

  const tabCounts = {
    All: tasks.length,
    Pending: tasks.filter(t => t.status === "Pending" && !t.isOverdue).length,
    Completed: tasks.filter(t => t.status === "Completed").length,
    Overdue: tasks.filter(t => t.isOverdue).length,
    Revision: tasks.filter(t => t.status === "Revision").length,
  };

  // get topics for selected subject in form
  const formSubjectTopics = subjects.find(s => s.name === form.subject)?.topics || [];

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>✅ Tasks</h1>
          <p>Create and manage your study tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Task</button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="card" style={{ marginBottom: 24 }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            <h3 style={{ marginBottom: 16 }}>New Task</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input className="input" style={{ gridColumn: "1/-1" }} placeholder="Task title *"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

              <select className="input" value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value, topic: "" })}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id}>{s.name}</option>)}
              </select>

              <select className="input" value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                <option value="">Select topic</option>
                {formSubjectTopics.map(t => <option key={t.id}>{t.name}</option>)}
              </select>

              <input className="input" type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />

              <select className="input" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" onClick={handleAdd}>Add Task</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input className="input" style={{ flex: 2, minWidth: 180 }} placeholder="🔍 Search tasks..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" style={{ flex: 1, minWidth: 130 }} value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id}>{s.name}</option>)}
          </select>
          <select className="input" style={{ flex: 1, minWidth: 130 }} value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="input" style={{ flex: 1, minWidth: 130 }} value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Sort: Newest</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t} <span style={{ marginLeft: 4, fontSize: "0.75rem" }}>({tabCounts[t]})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem" }}>✅</div>
          <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No tasks here. You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {filtered.map((task) => {
              const days = daysUntil(task.deadline);
              return (
                <motion.div key={task.id} className="card"
                  style={{ borderLeft: `4px solid ${task.isOverdue ? "var(--danger)" : task.priority === "High" ? "#f59e0b" : "var(--primary)"}` }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  layout
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>
                        {task.isOverdue && <span style={{ color: "var(--danger)" }}>⚠️ </span>}
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {task.subject && <span className="badge badge-purple">{task.subject}</span>}
                        {task.topic && <span className="badge badge-blue">{task.topic}</span>}
                        <span className={`badge ${priorityColor(task.priority)}`}>{task.priority}</span>
                        {task.deadline && (
                          <span className={`badge ${task.isOverdue ? "badge-red" : days <= 2 ? "badge-yellow" : "badge-green"}`}>
                            📅 {task.isOverdue ? "Overdue" : days === 0 ? "Due today" : `${days}d left`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {task.status !== "Completed" && (
                        <button className="btn btn-success btn-sm"
                          onClick={() => updateTaskStatus(task.id, "Completed")}>✓ Done</button>
                      )}
                      {task.status !== "Revision" && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => updateTaskStatus(task.id, "Revision")}>🔁</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task.id)}>🗑️</button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default Tasks;