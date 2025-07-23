import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt.types';
import { User } from '../auth/decorators/user.decorator';

@Controller('giorgio')
@UseGuards(JwtAuthGuard)
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto, @User() user: JwtPayload) {
    return this.aiAgentService.chatWithAgent(body.message, body.threadId, user);
  }

  @Get('conversations')
  async getConversations(@User() user: JwtPayload) {
    return this.aiAgentService.getConversations(user);
  }

  @Get('conversations/:threadId')
  async getConversationById(@Param('threadId') threadId: string, @User() user: JwtPayload) {
    return this.aiAgentService.getConversationById(threadId, user);
  }

  @Delete('conversations/:threadId')
  async deleteConversation(@Param('threadId') threadId: string, @User() user: JwtPayload) {
    return this.aiAgentService.deleteConversation(threadId, user);
  }
}
