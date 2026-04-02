import { format, parseISO, differenceInDays } from "date-fns";

export const formatDate = (dateStr) => {
  try { return format(parseISO(dateStr), "dd MMM yyyy"); }
  catch { return dateStr; }
};

export const daysUntil = (dateStr) => {
  try { return differenceInDays(parseISO(dateStr), new Date()); }
  catch { return null; }
};

export const priorityColor = (priority) => {
  if (priority === "High") return "badge-red";
  if (priority === "Medium") return "badge-yellow";
  return "badge-green";
};

export const statusColor = (status) => {
  if (status === "Completed") return "badge-green";
  if (status === "In Progress") return "badge-blue";
  if (status === "Needs Revision") return "badge-red";
  return "badge-yellow";
};

export const COLORS = ["#6366f1","#06b6d4","#22c55e","#f59e0b","#ef4444","#8b5cf6"];