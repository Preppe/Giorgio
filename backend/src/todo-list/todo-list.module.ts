import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoListController } from './todo-list.controller';
import { TodoListService } from './todo-list.service';
import { TodoList, TodoListSchema } from './schemas/todo-list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TodoList.name, schema: TodoListSchema },
    ]),
  ],
  controllers: [TodoListController],
  providers: [TodoListService],
  exports: [TodoListService],
})
export class TodoListModule {}