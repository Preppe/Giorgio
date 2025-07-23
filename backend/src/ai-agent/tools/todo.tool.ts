import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TodoListService } from '../../todo-list/todo-list.service';
import { JwtPayload } from '../../auth/types/jwt.types';

@Injectable()
export class TodoToolsService {
  constructor(private readonly todoListService: TodoListService) {}

  createTools(user: JwtPayload) {
    const createTodoListTool = new DynamicStructuredTool({
      name: 'create_todo_list',
      description: 'Create a new todo list',
      schema: z.object({
        name: z.string().describe('Todo list name (with optional emoji, e.g., "🛒 Shopping")'),
      }),
      func: async ({ name }: { name: string }) => {
        try {
          const trimmedName = name.trim();
          if (!trimmedName) {
            return '❌ Errore: il nome della todo list è obbligatorio';
          }

          let emoji = '';
          let listName = trimmedName;

          // Estrai emoji se presente all'inizio
          const emojiMatch = trimmedName.match(/^(\p{Emoji})\s+(.+)$/u);
          if (emojiMatch) {
            emoji = emojiMatch[1];
            listName = emojiMatch[2];
          }

          const todoList = await this.todoListService.create({ name: listName, emoji }, user.sub);
          return `✅ Todo list "${todoList.name}" creata con successo! ${todoList.emoji || ''}\nID: ${(todoList as any)._id}\nTasks: ${todoList.tasks.length}`;
        } catch (error) {
          return `❌ Errore nella creazione della todo list: ${error.message}`;
        }
      },
    });

    const getTodoListsTool = new DynamicStructuredTool({
      name: 'get_todo_lists',
      description: 'Get all user todo lists',
      schema: z.object({
        request: z.string().describe('List retrieval request (any text)'),
      }),
      func: async ({ request }: { request: string }) => {
        try {
          const todoLists = await this.todoListService.findAll(user.sub);
          if (todoLists.length === 0) {
            return '📝 Non hai ancora creato nessuna todo list. Puoi crearne una usando il comando create_todo_list.';
          }

          const formattedLists = todoLists
            .map(
              (list, index) =>
                `${index + 1}. ${list.emoji || '📝'} **${list.name}** (ID: ${(list as any)._id})\n   📋 ${list.tasks.length} task${list.tasks.length !== 1 ? 's' : ''} - Aggiornata: ${list.updatedAt.toLocaleDateString('it-IT')}`,
            )
            .join('\n\n');

          return `📚 Le tue todo lists (${todoLists.length}):\n\n${formattedLists}`;
        } catch (error) {
          return `❌ Errore nel recupero delle todo lists: ${error.message}`;
        }
      },
    });

    const addTaskTool = new DynamicStructuredTool({
      name: 'add_task',
      description: 'Add a task to a todo list',
      schema: z.object({
        listId: z.string().describe('Todo list ID'),
        title: z.string().describe('Task title'),
        priority: z.enum(['high', 'medium', 'low']).describe('Task priority (high, medium, low)'),
      }),
      func: async ({ listId, title, priority }: { listId: string; title: string; priority: 'high' | 'medium' | 'low' }) => {
        try {
          if (!listId.trim() || !title.trim()) {
            return '❌ ID lista e titolo task sono obbligatori';
          }

          const taskData: any = { title: title.trim() };
          if (priority) {
            taskData.priority = priority;
          }

          const updatedTodoList = await this.todoListService.addTask(listId.trim(), taskData, user.sub);
          const newTask = updatedTodoList.tasks[updatedTodoList.tasks.length - 1];

          const priorityInfo = newTask.priority ? ` [${newTask.priority.toUpperCase()}]` : '';

          return `✅ Task aggiunto con successo!\n📝 **${newTask.title}**${priorityInfo}\n📋 Todo list: ${updatedTodoList.name} (${updatedTodoList.tasks.length} task${updatedTodoList.tasks.length !== 1 ? 's' : ''})`;
        } catch (error) {
          return `❌ Errore nell'aggiunta del task: ${error.message}`;
        }
      },
    });

    const toggleTaskTool = new DynamicStructuredTool({
      name: 'toggle_task',
      description: 'Complete or reactivate a task',
      schema: z.object({
        listId: z.string().describe('Todo list ID'),
        taskId: z.string().describe('Task ID to complete or reactivate'),
      }),
      func: async ({ listId, taskId }: { listId: string; taskId: string }) => {
        try {
          if (!listId.trim() || !taskId.trim()) {
            return '❌ ID lista e ID task sono obbligatori';
          }

          const updatedTodoList = await this.todoListService.toggleTask(listId.trim(), taskId.trim(), user.sub);
          const toggledTask = updatedTodoList.tasks.find((task) => (task as any)._id.toString() === taskId.trim());

          if (!toggledTask) {
            return `❌ Task con ID "${taskId}" non trovato nella todo list.`;
          }

          const statusIcon = toggledTask.completed ? '✅' : '⏳';
          const statusText = toggledTask.completed ? 'completato' : 'riattivato';
          const priorityInfo = toggledTask.priority ? ` [${toggledTask.priority.toUpperCase()}]` : '';

          const completedCount = updatedTodoList.tasks.filter((task) => task.completed).length;
          const totalCount = updatedTodoList.tasks.length;

          return `${statusIcon} Task ${statusText}!\n📝 **${toggledTask.title}**${priorityInfo}\n📊 Progresso todo list: ${completedCount}/${totalCount} task completati`;
        } catch (error) {
          return `❌ Errore nel cambio stato del task: ${error.message}`;
        }
      },
    });

    const getTasksTool = new DynamicStructuredTool({
      name: 'get_tasks',
      description: 'Get tasks from a todo list by name',
      schema: z.object({
        listName: z.string().describe('Todo list name to retrieve tasks from'),
      }),
      func: async ({ listName }: { listName: string }) => {
        try {
          const trimmedListName = listName.trim();
          if (!trimmedListName) {
            return '❌ Nome della todo list è obbligatorio';
          }

          const todoList = await this.todoListService.findByName(trimmedListName, user.sub);
          if (!todoList) {
            return `❌ Todo list con nome "${trimmedListName}" non trovata.`;
          }

          if (todoList.tasks.length === 0) {
            return `📝 Nessun task trovato nella todo list "${todoList.name}".`;
          }

          const formattedTasks = todoList.tasks
            .map((task, index) => {
              const statusIcon = task.completed ? '✅' : '⏳';
              const priorityInfo = task.priority ? ` [${task.priority.toUpperCase()}]` : '';
              const categoryInfo = task.category ? ` 🏷️ ${task.category}` : '';
              const dueDateInfo = task.dueDate ? ` 📅 ${new Date(task.dueDate).toLocaleDateString('it-IT')}` : '';

              return `${index + 1}. ${statusIcon} **${task.title}**${priorityInfo}${categoryInfo}${dueDateInfo}\n   ID: ${(task as any)._id}`;
            })
            .join('\n\n');

          const completedCount = todoList.tasks.filter((task) => task.completed).length;
          const totalCount = todoList.tasks.length;

          return `📋 **${todoList.name}** - Tasks (${totalCount})\n📊 Progresso: ${completedCount}/${totalCount} completati\n\n${formattedTasks}`;
        } catch (error) {
          return `❌ Errore nel recupero dei task: ${error.message}`;
        }
      },
    });

    return [createTodoListTool, getTodoListsTool, addTaskTool, toggleTaskTool, getTasksTool];
  }
}
