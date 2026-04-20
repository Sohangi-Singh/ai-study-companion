import { useState } from "react";
import { StudyContext } from "./StudyContextObject";

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
  const [customRevisions, setCustomRevisionsRaw] = useState(() => load("customRevisions", []));

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

  const setCustomRevisions = (val) => {
    setCustomRevisionsRaw(val);
    localStorage.setItem("customRevisions", JSON.stringify(val));
  };

  const markTopicAttempted = (subjectId, topicId) => {
    const updated = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const updatedTopics = sub.topics.map((t) => {
        if (t.id !== topicId) return t;
        const attempts = (t.attempts || 0) + 1;
        return { ...t, attempts, status: attempts >= 2 ? "needs-revision" : t.status };
      });
      return { ...sub, topics: updatedTopics };
    });
    setSubjects(updated);
  };

  const logSession = (subjectName) => {
    const session = {
      id: Date.now(),
      subject: subjectName,
      date: new Date().toISOString(),
      day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    };
    setStudySessions([...studySessions, session]);
  };

  const addCustomRevision = (revision) => {
    const entry = {
      id: Date.now().toString(),
      ...revision,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setCustomRevisions([...customRevisions, entry]);
  };

  const markCustomRevised = (id) => {
    setCustomRevisions(customRevisions.map((r) => (r.id === id ? { ...r, status: "revised" } : r)));
  };
 
  const deleteCustomRevision = (id) => {
    setCustomRevisions(customRevisions.filter((r) => r.id !== id));
  };

  return (
    <StudyContext.Provider
      value={{
        subjects, setSubjects,
        tasks, setTasks,
        studySessions, setStudySessions,
        customRevisions,
        markTopicAttempted,
        logSession,
        addCustomRevision,
        markCustomRevised,
        deleteCustomRevision,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};
