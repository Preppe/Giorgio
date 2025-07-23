import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiAgentService } from './ai-agent.service';
import { AiAgentController } from './ai-agent.controller';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { TodoListModule } from '../todo-list/todo-list.module';
import { MemoryModule } from '../memory/memory.module';
import { TodoToolsService } from './tools/todo.tool';
import { MemoryToolsService } from './tools/memory.tool';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    TodoListModule,
    MemoryModule,
  ],
  controllers: [AiAgentController],
  providers: [AiAgentService, TodoToolsService, MemoryToolsService],
  exports: [AiAgentService],
})
export class AiAgentModule {}
