import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";
import { format, parseISO, startOfWeek, isWithinInterval, endOfWeek } from "date-fns";

function useProgress() {
  const { subjects, tasks, studySessions } = useContext(StudyContext);

  const totalTopics = subjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
  const completedTopics = subjects.reduce((acc, s) => acc + (s.topics?.filter(t => t.status === "Completed").length || 0), 0);
  const needsRevision = subjects.reduce((acc, s) => acc + (s.topics?.filter(t => t.status === "Needs Revision").length || 0), 0);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const overdueTasks = tasks.filter(t => t.isOverdue).length;

  const completionPercent = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  // subject-wise progress for chart
  const subjectProgress = subjects.map((s) => {
    const total = s.topics?.length || 0;
    const done = s.topics?.filter(t => t.status === "Completed").length || 0;
    return {
      name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
      completed: done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100)
    };
  });

  // productivity insights
  const dayCount = {};
  studySessions.forEach((s) => {
    dayCount[s.day] = (dayCount[s.day] || 0) + 1;
  });
  const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  // sessions this week
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const sessionsThisWeek = studySessions.filter((s) => {
    try {
      return isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd });
    } catch { return false; }
  }).length;

  return {
    totalTopics, completedTopics, needsRevision,
    totalTasks, completedTasks, pendingTasks, overdueTasks,
    completionPercent, subjectProgress,
    bestDay, sessionsThisWeek
  };
}

export default useProgress;