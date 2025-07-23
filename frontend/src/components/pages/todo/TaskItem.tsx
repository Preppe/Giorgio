import { Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SwipeableItem } from "@/components/ui/SwipeableItem";
import { type Task } from "@/hooks/todo";
import { getPriorityColor, getPriorityIcon, formatDate } from "@/utils/taskUtils";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export const TaskItem = ({ task, onToggle, onDelete, isToggling, isDeleting }: TaskItemProps) => {
  const PriorityIcon = getPriorityIcon(task.priority);

  return (
    <SwipeableItem
      key={task._id}
      id={task._id}
      onDelete={onDelete}
      isDeleting={isDeleting}
      swipeThreshold={0.7}
      showOptions={true}
      onEdit={() => {
        // TODO: Implement edit functionality
      }}
      onToggle={onToggle}
      isToggling={isToggling}
    >
      <div className={`hologram-panel border-primary/20 backdrop-blur-sm p-0 ${
        task.completed ? "opacity-60" : ""
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggle(task._id)}
              disabled={isToggling}
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${
                task.completed ? "line-through text-primary/60" : "text-foreground"
              }`}>
                {task.title}
              </h3>

              <div className="flex items-center space-x-4 mt-2">
                {/* Category */}
                {task.category && (
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-primary/60" />
                    <span className="text-xs text-primary/60">{task.category}</span>
                  </div>
                )}

                {/* Priority */}
                {task.priority && PriorityIcon && (
                  <div className={`flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                    <PriorityIcon className="w-3 h-3" />
                    <span className="text-xs">{task.priority}</span>
                  </div>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-primary/60" />
                    <span className="text-xs text-primary/60">{formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </SwipeableItem>
  );
};