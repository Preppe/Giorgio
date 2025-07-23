import { useState } from "react";
import { CheckSquare, Loader2, Plus } from "lucide-react";
import { AutoComplete, type Option } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type CreateTaskInput, type Task } from "@/hooks/todo";

interface AddTaskFormProps {
  onAddTask: (task: CreateTaskInput) => void;
  isLoading: boolean;
}

const commonCategories = ["spesa", "frutta", "latticini", "verdura", "carne", "pesce", "altro"];

export const AddTaskForm = ({ onAddTask, isLoading }: AddTaskFormProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskInput>({
    title: "",
    category: "",
    dueDate: "",
    priority: "medium",
  });

  const categoryOptions: Option[] = commonCategories.map((category) => ({
    value: category,
    label: category,
  }));

  const handleSubmit = () => {
    onAddTask({
      title: newTask.title.trim(),
      category: newTask.category || undefined,
      dueDate: newTask.dueDate || undefined,
      priority: newTask.priority,
    });

    // Reset form
    setNewTask({
      title: "",
      category: "",
      dueDate: "",
      priority: "medium",
    });
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setNewTask({ title: "", category: "", dueDate: "", priority: "medium" });
  };

  return (
    <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
      <CardContent className="p-4">
        {!showAddForm ? (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle" className="text-primary/80">
                Task Title
              </Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
                placeholder="Enter task title"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskCategory" className="text-primary/80">
                  Category
                </Label>
                <AutoComplete
                  options={categoryOptions}
                  placeholder="Select or type category"
                  value={newTask.category ? { value: newTask.category, label: newTask.category } : undefined}
                  onValueChange={(option) => setNewTask({ ...newTask, category: option.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskPriority" className="text-primary/80">
                  Priority
                </Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}>
                  <SelectTrigger className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDueDate" className="text-primary/80">
                Due Date (optional)
              </Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-primary/30 text-primary/60 hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !newTask.title.trim()}
                className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                {isLoading ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};