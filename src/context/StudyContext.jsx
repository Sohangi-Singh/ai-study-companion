import { createContext, useState, useEffect } from "react";

export const StudyContext = createContext();

// helper to load from localStorage
const load = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const StudyProvider = ({ children }) => {
  const [subjects, setSubjectsRaw] = useState(() => load("subjects", []));
  const [tasks, setTasksRaw] = useState(() => load("tasks", []));
  const [studySessions, setStudySessionsRaw] = useState(() => load("studySessions", []));

  // wrap setters so they ALSO save to localStorage automatically
  const setSubjects = (val) => {
    setSubjectsRaw(val);
    localStorage.setItem("subjects", JSON.stringify(val));
  };

  const setTasks = (val) => {
    setTasksRaw(val);
    localStorage.setItem("tasks", JSON.stringify(val));
  };

  const setStudySessions = (val) => {
    setStudySessionsRaw(val);
    localStorage.setItem("studySessions", JSON.stringify(val));
  };

  // Smart weakness detection - auto flags topics attempted 2+ times as "needs revision"
  const markTopicAttempted = (subjectId, topicId) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const updatedTopics = sub.topics.map((t) => {
        if (t.id !== topicId) return t;
        const attempts = (t.attempts || 0) + 1;
        return {
          ...t,
          attempts,
          status: attempts >= 2 ? "needs-revision" : t.status
        };
      });
      return { ...sub, topics: updatedTopics };
    });
    setSubjects(updated);
  };

  // Log a study session for productivity insights
  const logSession = (subjectName) => {
    const session = {
      id: Date.now(),
      subject: subjectName,
      date: new Date().toISOString(),
      day: new Date().toLocaleDateString("en-US", { weekday: "long" })
    };
    setStudySessions([...studySessions, session]);
  };

  return (
    <StudyContext.Provider value={{
      subjects, setSubjects,
      tasks, setTasks,
      studySessions, setStudySessions,
      markTopicAttempted,
      logSession
    }}>
      {children}
    </StudyContext.Provider>
  );
};