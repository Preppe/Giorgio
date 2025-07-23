import { AlertCircle, CheckSquare, Tag } from "lucide-react";
import { type Task } from "@/hooks/todo";

export const getPriorityColor = (priority?: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "text-red-400 border-red-500/30";
    case "medium":
      return "text-yellow-400 border-yellow-500/30";
    case "low":
      return "text-green-400 border-green-500/30";
    default:
      return "text-primary/60 border-primary/30";
  }
};

export const getPriorityIcon = (priority?: Task["priority"]) => {
  switch (priority) {
    case "high":
      return AlertCircle;
    case "medium":
      return Tag;
    case "low":
      return CheckSquare;
    default:
      return null;
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const filterTasks = (tasks: Task[]) => {
  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);
  
  return {
    completedTasks,
    incompleteTasks,
    completedCount: completedTasks.length,
    totalCount: tasks.length,
  };
};