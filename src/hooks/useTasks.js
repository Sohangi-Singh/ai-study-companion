import { useContext } from "react";
import { StudyContext } from "../context/StudyContextObject";
import { toast } from "react-toastify";
import { isPast, parseISO } from "date-fns";

function useTasks() {
  const { tasks, setTasks } = useContext(StudyContext);

  const addTask = (taskData) => {
    if (!taskData.title.trim()) return toast.error("Task title is required");
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title.trim(),
      subject: taskData.subject || "",
      topic: taskData.topic || "",
      deadline: taskData.deadline || "",
      priority: taskData.priority || "Medium",
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    toast.success("Task added!");
  };

  const updateTaskStatus = (id, status) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status, completedAt: status === "Completed" ? new Date().toISOString() : undefined } : t
    );
    setTasks(updated);
    toast.success(`Task marked as ${status}`);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    toast.info("Task deleted");
  };

  // auto-detect overdue: deadline is in the past and task is still Pending
  const enrichedTasks = tasks.map((t) => ({
    ...t,
    isOverdue: t.deadline && t.status === "Pending" && isPast(parseISO(t.deadline))
  }));

  const filterTasks = (tab, search = "", filters = {}) => {
    return enrichedTasks.filter((t) => {
      const matchTab =
        tab === "All" ? true :
        tab === "Pending" ? t.status === "Pending" && !t.isOverdue :
        tab === "Completed" ? t.status === "Completed" :
        tab === "Overdue" ? t.isOverdue :
        tab === "Revision" ? t.status === "Revision" : true;

      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchSubject = !filters.subject || t.subject === filters.subject;
      const matchPriority = !filters.priority || t.priority === filters.priority;

      return matchTab && matchSearch && matchSubject && matchPriority;
    });
  };

  return { tasks: enrichedTasks, addTask, updateTaskStatus, deleteTask, filterTasks };
}

export default useTasks;
