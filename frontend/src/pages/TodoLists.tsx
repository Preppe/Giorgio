import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckSquare, Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { type Task, type TodoList, useCreateTodoList, useDeleteTodoList, useTodoLists } from '@/hooks/todo';
import { useToast } from '@/hooks/use-toast';

import { useHeaderStore } from '@/stores/headerStore';

const TodoLists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setTitle, resetTitle } = useHeaderStore();

  useEffect(() => {
    setTitle('TODO LISTS');
    return () => resetTitle();
  }, [setTitle, resetTitle]);

  // API hooks
  const { data: lists, isLoading, error } = useTodoLists();
  const createTodoListMutation = useCreateTodoList();
  const deleteTodoListMutation = useDeleteTodoList();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListEmoji, setNewListEmoji] = useState('📋');

  // Common emoji options for quick selection
  const commonEmojis = ['📋', '🛒', '🍎', '🥛', '📝', '✅', '🎯', '💼', '🏠', '📚'];

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load todo lists. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleAddList = () => {
    if (!newListName.trim()) {
      toast({
        title: 'Validation error',
        description: 'Please enter a list name.',
        variant: 'destructive',
      });
      return;
    }

    createTodoListMutation.mutate(
      {
        name: newListName.trim(),
        emoji: newListEmoji,
      },
      {
        onSuccess: (newList) => {
          setNewListName('');
          setNewListEmoji('📋');
          setShowAddForm(false);

          toast({
            title: 'List created',
            description: `"${newList.name}" has been added to your lists.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: 'Failed to create todo list. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleDeleteList = (listId: string) => {
    deleteTodoListMutation.mutate(listId, {
      onSuccess: () => {
        toast({
          title: 'List deleted',
          description: 'The list has been removed.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Failed to delete todo list. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleOpenList = (listId: string) => {
    navigate(`/todo/${listId}`);
  };

  const getTaskCounts = (tasks: Task[]) => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    return { completed, total };
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4">
        {/* Add New List Button */}
        <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
          <CardContent className="p-4">
            {!showAddForm ? (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New List
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="listName" className="text-primary/80">
                    List Name
                  </Label>
                  <Input
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="bg-background/60 border-primary/30 focus:border-primary/60 text-foreground"
                    placeholder="Enter list name"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-primary/80">Choose Emoji</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewListEmoji(emoji)}
                        className={`border-primary/30 text-foreground hover:bg-primary/10 ${newListEmoji === emoji ? 'bg-primary/20 border-primary/50' : ''}`}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewListName('');
                      setNewListEmoji('📋');
                    }}
                    className="border-primary/30 text-primary/60 hover:bg-primary/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddList}
                    disabled={createTodoListMutation.isPending}
                    className="bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary disabled:opacity-50"
                  >
                    {createTodoListMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                    {createTodoListMutation.isPending ? 'Creating...' : 'Create List'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary/60" />
                <div>
                  <h3 className="text-primary font-medium">Loading Lists</h3>
                  <p className="text-primary/60 text-sm mt-1">Please wait...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : lists && lists.length === 0 ? (
          <Card className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <CheckSquare className="w-8 h-8 text-primary/60" />
                </div>
                <div>
                  <h3 className="text-primary font-medium">No Lists Yet</h3>
                  <p className="text-primary/60 text-sm mt-1">Create your first todo list to get started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : lists ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lists.map((list) => {
              const { completed, total } = getTaskCounts(list.tasks);

              return (
                <Card
                  key={list._id}
                  className="hologram-panel border-primary/20 bg-background/40 backdrop-blur-sm cursor-pointer hover:bg-primary/10 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => handleOpenList(list._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{list.emoji || '📋'}</div>
                        <div>
                          <CardTitle className="text-primary text-lg">{list.name}</CardTitle>
                          <CardDescription className="text-primary/60">{total === 0 ? 'No tasks' : `${completed}/${total} completed`}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Progress bar */}
                    <div className="w-full bg-primary/20 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: total === 0 ? '0%' : `${(completed / total) * 100}%` }}
                      />
                    </div>

                    {/* Quick actions */}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-primary/60">{total === 0 ? 'Empty list' : `${total} task${total !== 1 ? 's' : ''}`}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteTodoListMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list._id);
                        }}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50"
                      >
                        {deleteTodoListMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Decorative holographic overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default TodoLists;
