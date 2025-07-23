import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type CreateTaskInput, useCreateTask, useDeleteTask, useTodoList, useToggleTask } from "@/hooks/todo";
import { useToast } from "@/hooks/use-toast";
import { useHeaderStore } from "@/stores/headerStore";
import { filterTasks } from "@/utils/taskUtils";
import { TodoProgressBar } from "@/components/pages/todo/TodoProgressBar";
import { LoadingState } from "@/components/pages/todo/LoadingState";
import { EmptyState } from "@/components/pages/todo/EmptyState";
import { AddTaskForm } from "@/components/pages/todo/AddTaskForm";
import { TaskSection } from "@/components/pages/todo/TaskSection";

const TodoList = () => {
  const navigate = useNavigate();
  const { listId } = useParams<{ listId: string }>();
  const { toast } = useToast();
  const { setTitle, resetTitle } = useHeaderStore();

  // API hooks
  const { data: todoList, isLoading, error } = useTodoList(listId);
  const createTaskMutation = useCreateTask();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();

  useEffect(() => {
    if (todoList) {
      setTitle(`${todoList.emoji || "📋"} ${todoList.name}`);
    }
    return () => resetTitle();
  }, [setTitle, resetTitle, todoList]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load todo list. Please try again.",
        variant: "destructive",
      });
      navigate("/todo-lists");
    }
  }, [error, toast, navigate]);


  const handleAddTask = (taskInput: CreateTaskInput) => {
    if (!taskInput.title.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a task title.",
        variant: "destructive",
      });
      return;
    }

    if (!listId) return;

    createTaskMutation.mutate(
      {
        listId,
        input: taskInput,
      },
      {
        onSuccess: () => {
          toast({
            title: "Task added",
            description: `"${taskInput.title}" has been added to your list.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create task. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleToggleTask = (taskId: string) => {
    if (!listId) return;

    toggleTaskMutation.mutate(
      { listId, taskId },
      {
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update task. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  // Function will be used by SwipeableItem component
  const handleDeleteTask = (taskId: string) => {
    if (!listId) return;

    deleteTaskMutation.mutate(
      { listId, taskId },
      {
        onSuccess: () => {
          toast({
            title: "Task deleted",
            description: "The task has been removed.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete task. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleDeleteAllCompleted = () => {
    if (!listId) return;

    const tasks = todoList?.tasks || [];
    const { completedTasks } = filterTasks(tasks);

    completedTasks.forEach((task) => {
      deleteTaskMutation.mutate(
        { listId, taskId: task._id },
        {
          onSuccess: () => {
            toast({
              title: "Completed tasks deleted",
              description: "All completed tasks have been removed.",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to delete some tasks. Please try again.",
              variant: "destructive",
            });
          },
        },
      );
    });
  };


  const tasks = todoList?.tasks || [];
  const { completedTasks, incompleteTasks, completedCount, totalCount } = filterTasks(tasks);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  if (!todoList) {
    return null;
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      <TodoProgressBar completedCount={completedCount} totalCount={totalCount} />

      <div className="flex-1 overflow-y-auto space-y-4 px-4">
        <AddTaskForm onAddTask={handleAddTask} isLoading={createTaskMutation.isPending} />

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <TaskSection
              title="Da fare"
              tasks={incompleteTasks}
              taskCount={incompleteTasks.length}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              isToggling={toggleTaskMutation.isPending}
              isDeleting={deleteTaskMutation.isPending}
            />

            <TaskSection
              title="Fatti"
              tasks={completedTasks}
              taskCount={completedTasks.length}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onDeleteAll={handleDeleteAllCompleted}
              isToggling={toggleTaskMutation.isPending}
              isDeleting={deleteTaskMutation.isPending}
              showDeleteAll={true}
            />
          </div>
        )}
      </div>

      {/* Decorative holographic overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default TodoList;
