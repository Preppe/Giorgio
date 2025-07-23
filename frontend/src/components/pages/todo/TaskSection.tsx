import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Task } from "@/hooks/todo";
import { TaskItem } from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  taskCount: number;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteAll?: () => void;
  isToggling: boolean;
  isDeleting: boolean;
  showDeleteAll?: boolean;
}

export const TaskSection = ({
  title,
  tasks,
  taskCount,
  onToggleTask,
  onDeleteTask,
  onDeleteAll,
  isToggling,
  isDeleting,
  showDeleteAll = false,
}: TaskSectionProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className={`font-medium text-lg ${
          showDeleteAll ? "text-primary/60" : "text-primary"
        }`}>
          {title} ({taskCount})
        </h2>
        {showDeleteAll && onDeleteAll && (
          <Button
            onClick={onDeleteAll}
            disabled={isDeleting}
            size="sm"
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Elimina tutti
          </Button>
        )}
      </div>
      
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          isToggling={isToggling}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};