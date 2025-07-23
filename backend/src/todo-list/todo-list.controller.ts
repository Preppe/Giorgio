import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TodoListService } from './todo-list.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { UpdateTodoListDto } from './dto/update-todo-list.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TodoList } from './schemas/todo-list.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { JwtPayload } from '../auth/types/jwt.types';

@ApiTags('todo-lists')
@Controller('todo-lists')
@UseGuards(JwtAuthGuard)
export class TodoListController {
  constructor(private readonly todoListService: TodoListService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo list' })
  @ApiResponse({ status: 201, description: 'Todo list created successfully' })
  @ApiBody({ type: CreateTodoListDto })
  create(@Body() createTodoListDto: CreateTodoListDto, @User() user: JwtPayload): Promise<TodoList> {
    return this.todoListService.create(createTodoListDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todo lists' })
  @ApiResponse({ status: 200, description: 'Return all todo lists' })
  findAll(@User() user: JwtPayload): Promise<TodoList[]> {
    return this.todoListService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get todo list by ID' })
  @ApiParam({ name: 'id', description: 'Todo list ID' })
  @ApiResponse({ status: 200, description: 'Return the todo list' })
  @ApiResponse({ status: 404, description: 'Todo list not found' })
  findOne(@Param('id') id: string, @User() user: JwtPayload): Promise<TodoList> {
    return this.todoListService.findOne(id, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update todo list' })
  @ApiParam({ name: 'id', description: 'Todo list ID' })
  @ApiBody({ type: UpdateTodoListDto })
  @ApiResponse({ status: 200, description: 'Todo list updated successfully' })
  @ApiResponse({ status: 404, description: 'Todo list not found' })
  update(@Param('id') id: string, @Body() updateTodoListDto: UpdateTodoListDto, @User() user: JwtPayload): Promise<TodoList> {
    return this.todoListService.update(id, updateTodoListDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete todo list' })
  @ApiParam({ name: 'id', description: 'Todo list ID' })
  @ApiResponse({ status: 204, description: 'Todo list deleted successfully' })
  @ApiResponse({ status: 404, description: 'Todo list not found' })
  remove(@Param('id') id: string, @User() user: JwtPayload): Promise<void> {
    return this.todoListService.remove(id, user.sub);
  }

  @Post(':listId/tasks')
  @ApiOperation({ summary: 'Add task to todo list' })
  @ApiParam({ name: 'listId', description: 'Todo list ID' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task added successfully' })
  @ApiResponse({ status: 404, description: 'Todo list not found' })
  addTask(@Param('listId') listId: string, @Body() createTaskDto: CreateTaskDto, @User() user: JwtPayload): Promise<TodoList> {
    return this.todoListService.addTask(listId, createTaskDto, user.sub);
  }

  @Put(':listId/tasks/:taskId')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'listId', description: 'Todo list ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Todo list or task not found' })
  updateTask(
    @Param('listId') listId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user: JwtPayload,
  ): Promise<TodoList> {
    return this.todoListService.updateTask(listId, taskId, updateTaskDto, user.sub);
  }

  @Patch(':listId/tasks/:taskId/toggle')
  @ApiOperation({ summary: 'Toggle task completion status' })
  @ApiParam({ name: 'listId', description: 'Todo list ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task toggled successfully' })
  @ApiResponse({ status: 404, description: 'Todo list or task not found' })
  toggleTask(@Param('listId') listId: string, @Param('taskId') taskId: string, @User() user: JwtPayload): Promise<TodoList> {
    return this.todoListService.toggleTask(listId, taskId, user.sub);
  }

  @Delete(':listId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'listId', description: 'Todo list ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Todo list or task not found' })
  async removeTask(@Param('listId') listId: string, @Param('taskId') taskId: string, @User() user: JwtPayload): Promise<void> {
    await this.todoListService.removeTask(listId, taskId, user.sub);
  }
}
