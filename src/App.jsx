import { Routes, Route, NavLink } from "react-router-dom";
import { useState, useContext, useMemo, useEffect } from "react";
import { addDays, parseISO, startOfDay, differenceInCalendarDays } from "date-fns";

import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Tasks from "./pages/Tasks";
import Revision from "./pages/Revision";
import AITools from "./pages/AITools";
import { StudyContext } from "./context/StudyContextObject";
import { FiAward, FiBarChart2, FiBookOpen, FiCheckSquare, FiCpu, FiMoon, FiRefreshCw, FiSun } from "react-icons/fi";

const NAV = [
  { to: "/", label: "Dashboard", icon: FiBarChart2 },
  { to: "/subjects", label: "Subjects", icon: FiBookOpen },
  { to: "/tasks", label: "Tasks", icon: FiCheckSquare },
  { to: "/revision", label: "Revision", icon: FiRefreshCw, showBadge: true },
  { to: "/ai-tools", label: "AI Tools", icon: FiCpu },
];

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true");
  const { subjects } = useContext(StudyContext);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark);
  }, [dark]);

  const pendingRevisions = useMemo(() => {
    const today = startOfDay(new Date());
    return subjects.flatMap((s) =>
      (s.topics || []).filter((t) => {
        if (!t.completedAt || t.status === "Revised") return false;
        const revDate = startOfDay(addDays(parseISO(t.completedAt), 3));
        return differenceInCalendarDays(revDate, today) <= 0;
      })
    ).length + subjects.flatMap((s) =>
      (s.topics || []).filter((t) => t.status === "Needs Revision")
    ).length;
  }, [subjects]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <FiAward className="sidebar-logo-icon" aria-hidden="true" />
          <span>StudyAI</span>
        </div>
        <nav>
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                <span className="nav-icon"><Icon aria-hidden="true" /></span>
                <span>{n.label}</span>
                {n.showBadge && pendingRevisions > 0 && (
                  <span className="nav-badge">{pendingRevisions}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding: "12px 24px" }}>
          <button className="btn btn-outline btn-with-icon" style={{ width: "100%" }} onClick={() => setDark(!dark)}>
            {dark ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/ai-tools" element={<AITools />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
