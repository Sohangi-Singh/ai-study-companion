import { Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Tasks from "./pages/Tasks";
import Revision from "./pages/Revision";
import AITools from "./pages/AITools";

const NAV = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/subjects", label: "Subjects", icon: "📚" },
  { to: "/tasks", label: "Tasks", icon: "✅" },
  { to: "/revision", label: "Revision", icon: "🔁" },
  { to: "/ai-tools", label: "AI Tools", icon: "🤖" },
];

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark);
  }, [dark]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🎓 StudyAI</div>
        <nav>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: "12px 24px" }}>
          <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light" : "🌙 Dark"}
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