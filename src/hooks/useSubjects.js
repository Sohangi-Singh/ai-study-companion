import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";
import { toast } from "react-toastify";

function useSubjects() {
  const { subjects, setSubjects } = useContext(StudyContext);

  const addSubject = (name, description = "", color = "#6366f1") => {
    if (!name.trim()) return toast.error("Subject name is required");
    const newSubject = {
      id: Date.now().toString(),
      name: name.trim(),
      description,
      color,
      topics: []
    };
    setSubjects([...subjects, newSubject]);
    toast.success(`Subject "${name}" added!`);
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    toast.info("Subject deleted");
  };

  const addTopic = (subjectId, topicData) => {
    if (!topicData.name.trim()) return toast.error("Topic name is required");
    const newTopic = {
      id: Date.now().toString(),
      name: topicData.name.trim(),
      difficulty: topicData.difficulty || "Medium",
      status: "Not Started",
      notes: topicData.notes || "",
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    const updated = subjects.map((s) =>
      s.id === subjectId
        ? { ...s, topics: [...(s.topics || []), newTopic] }
        : s
    );
    setSubjects(updated);
    toast.success(`Topic "${topicData.name}" added!`);
  };

  const updateTopicStatus = (subjectId, topicId, status) => {
    const updated = subjects.map((s) => {
      if (s.id !== subjectId) return s;
      const updatedTopics = s.topics.map((t) => {
        if (t.id !== topicId) return t;
        const attempts = status === "Needs Revision" ? (t.attempts || 0) + 1 : t.attempts;
        return { ...t, status, attempts, completedAt: status === "Completed" ? new Date().toISOString() : t.completedAt };
      });
      return { ...s, topics: updatedTopics };
    });
    setSubjects(updated);
    toast.success("Topic status updated!");
  };

  const deleteTopic = (subjectId, topicId) => {
    const updated = subjects.map((s) =>
      s.id === subjectId
        ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
        : s
    );
    setSubjects(updated);
  };

  return { subjects, addSubject, deleteSubject, addTopic, updateTopicStatus, deleteTopic };
}

export default useSubjects;