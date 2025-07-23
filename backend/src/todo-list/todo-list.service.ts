import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TodoList } from './schemas/todo-list.schema';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TodoListService {
  constructor(
    @InjectModel(TodoList.name) private todoListModel: Model<TodoList>,
  ) {}

  async create(createTodoListDto: CreateTodoListDto, userId: string): Promise<TodoList> {
    const todoList = new this.todoListModel({
      ...createTodoListDto,
      userId: new Types.ObjectId(userId),
    });
    return todoList.save();
  }

  async findAll(userId: string): Promise<TodoList[]> {
    return this.todoListModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findOne(id: string, userId: string): Promise<TodoList> {
    const todoList = await this.todoListModel.findOne({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    }).exec();
    if (!todoList) {
      throw new NotFoundException(`TodoList with ID ${id} not found`);
    }
    return todoList;
  }

  async findByName(name: string, userId: string): Promise<TodoList> {
    const todoList = await this.todoListModel.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      userId: new Types.ObjectId(userId) 
    }).exec();
    if (!todoList) {
      throw new NotFoundException(`TodoList with name "${name}" not found`);
    }
    return todoList;
  }

  async update(id: string, updateTodoListDto: UpdateTodoListDto, userId: string): Promise<TodoList> {
    const todoList = await this.todoListModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateTodoListDto, 
        { new: true }
      )
      .exec();
    
    if (!todoList) {
      throw new NotFoundException(`TodoList with ID ${id} not found`);
    }
    return todoList;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.todoListModel.findOneAndDelete({ 
      _id: id, 
      userId: new Types.ObjectId(userId) 
    }).exec();
    if (!result) {
      throw new NotFoundException(`TodoList with ID ${id} not found`);
    }
  }

  async addTask(listId: string, createTaskDto: CreateTaskDto, userId: string): Promise<TodoList> {
    const todoList = await this.findOne(listId, userId);
    
    const newTask = {
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      completed: false,
    } as any;

    todoList.tasks.push(newTask);
    return todoList.save();
  }

  async updateTask(listId: string, taskId: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<TodoList> {
    const todoList = await this.findOne(listId, userId);
    const taskIndex = todoList.tasks.findIndex(task => (task as any)._id.toString() === taskId);
    
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const updatedTask = {
      ...(todoList.tasks[taskIndex] as any).toObject(),
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : todoList.tasks[taskIndex].dueDate,
    };

    todoList.tasks[taskIndex] = updatedTask as any;
    return todoList.save();
  }

  async toggleTask(listId: string, taskId: string, userId: string): Promise<TodoList> {
    const todoList = await this.findOne(listId, userId);
    const task = todoList.tasks.find(task => (task as any)._id.toString() === taskId);
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    task.completed = !task.completed;
    return todoList.save();
  }

  async removeTask(listId: string, taskId: string, userId: string): Promise<TodoList> {
    const todoList = await this.findOne(listId, userId);
    const taskIndex = todoList.tasks.findIndex(task => (task as any)._id.toString() === taskId);
    
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    todoList.tasks.splice(taskIndex, 1);
    return todoList.save();
  }
}