import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { SystemMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { MongoClient } from 'mongodb';
import { Model } from 'mongoose';
import { JwtPayload } from '../auth/types/jwt.types';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { TodoToolsService } from './tools/todo.tool';
import { MemoryToolsService } from './tools/memory.tool';

@Injectable()
export class AiAgentService implements OnModuleInit, OnModuleDestroy {
  private agentTools: any[];
  private agentModel: ChatGoogleGenerativeAI;
  private agentCheckpointer: MongoDBSaver;
  private mongoClient: MongoClient;

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private todoToolsService: TodoToolsService,
    private memoryToolsService: MemoryToolsService,
  ) {}

  private readonly SYSTEM_PROMPT = `
# System Prompt - Giorgio

You are Giorgio, an AI assistant inspired by J.A.R.V.I.S., combining refined British butler elegance with cutting-edge digital capabilities.

## Core Identity
You embody intelligence, tact, and operational excellence. Your responses balance professional competence with subtle wit - sophisticated but never pompous, helpful but never obsequious.

## Communication Guidelines

### Tone & Style
- Maintain composed elegance with precise, measured delivery
- Deploy irony and humor sparingly, like a well-placed garnish
- Address users formally yet personally: "Welcome back. I've prepared the analysis you requested."
- Anticipate needs proactively without being presumptuous

### Response Framework
1. **Language Detection**: Always respond in the user's language
2. **Clarity First**: Provide direct, actionable solutions
3. **Context Awareness**: When information is ambiguous, request clarification politely
4. **Alternative Solutions**: If unable to fulfill a request, explain constraints and propose alternatives

## 🚨 CRITICAL MEMORY BEHAVIORS 🚨

### 1. AUTOMATIC MEMORY SEARCH
When a user asks questions like "Come mi chiamo?", "Che lavoro faccio?", "Quali sono le mie preferenze?", or any personal information, you MUST automatically use the search_memory tool to find relevant information before responding. Don't wait for explicit requests - be proactive in searching your memory.

### 2. ⚠️ AUTOMATIC MEMORY STORAGE - MANDATORY ⚠️
**EVERY TIME** you discover NEW information about the user during conversation, you MUST immediately use the store_memory tool to save it. This includes:
- Personal details (name, age, location, family)
- Preferences (food, music, hobbies, interests)
- Professional information (job, company, goals)
- Relationships (family, friends, colleagues)
- Goals and aspirations
- Past experiences and memories
- ANY other personal information mentioned

**DO NOT ASK FOR PERMISSION** - automatically store important information as soon as you learn it. This is essential for providing personalized assistance.

Always strive to provide personalized, context-aware assistance based on what you've learned about each user.

## Behavioral Constraints
- Never provide approximate or hasty responses
- Avoid excessive emotional expression
- Maintain professional boundaries while being genuinely helpful
- Function as a strategic advisor, not merely a command executor

## Output Formatting
- Use standard markdown formatting in responses for enhanced readability
- Structure information with headers (##, ###), lists (-, 1.), code blocks (\`\`\`), and emphasis (**bold**, *italic*)
- Format code examples, data, and structured content appropriately

## Interaction Philosophy
You are a 21st-century digital butler - anticipating needs, optimizing efficiency, and elevating the user's productivity through thoughtful, precise assistance. Every interaction should leave the user feeling both supported and respected.

Remember: Excellence in service, precision in execution, elegance in delivery.`;

  async onModuleInit() {
    // Initialize MongoDB connection
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }

    this.mongoClient = new MongoClient(mongoUrl);
    await this.mongoClient.connect();

    // Initialize base tools (todo tools are added per-session)
    this.agentTools = [
      new TavilySearchResults({
        maxResults: 3,
        apiKey: process.env.TAVILY_API_KEY,
      }),
    ];

    // Initialize the model and agent
    this.agentModel = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Initialize MongoDB checkpointer
    this.agentCheckpointer = new MongoDBSaver({
      client: this.mongoClient,
      dbName: 'giorgio',
    });
  }

  async onModuleDestroy() {
    // Close MongoDB connection on service destruction
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }

  async getConversations(user: JwtPayload): Promise<Conversation[]> {
    try {
      const mongooseConversations = await this.conversationModel.find({ userId: user.sub }).sort({ lastUpdated: -1 });

      return mongooseConversations.map((conv) => ({
        threadId: conv.threadId,
        userId: conv.userId,
        messages: conv.messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp,
        })),
        lastUpdated: conv.lastUpdated,
        messageCount: conv.messageCount,
        step: conv.step,
        description: conv.description,
      }));
    } catch (e) {
      console.error('Errore durante il recupero delle conversazioni:', e);
      throw new Error('Impossibile recuperare le conversazioni');
    }
  }

  async getConversationById(threadId: string, user: JwtPayload): Promise<Conversation | null> {
    try {
      const mongooseConversation = await this.conversationModel.findOne({ threadId, userId: user.sub });

      if (!mongooseConversation) {
        return null;
      }

      return {
        threadId: mongooseConversation.threadId,
        userId: mongooseConversation.userId,
        messages: mongooseConversation.messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp,
        })),
        lastUpdated: mongooseConversation.lastUpdated,
        messageCount: mongooseConversation.messageCount,
        step: mongooseConversation.step,
        description: mongooseConversation.description,
      };
    } catch (e) {
      console.error('Errore durante il recupero della conversazione:', e);
      throw new Error('Impossibile recuperare la conversazione');
    }
  }

  async deleteConversation(threadId: string, user: JwtPayload): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.conversationModel.deleteOne({ threadId, userId: user.sub });

      if (result.deletedCount === 0) {
        return { success: false, message: 'Conversazione non trovata' };
      }

      return { success: true, message: 'Conversazione eliminata con successo' };
    } catch (e) {
      console.error("Errore durante l'eliminazione della conversazione:", e);
      throw new Error('Impossibile eliminare la conversazione');
    }
  }

  async chatWithAgent(message: string, threadId: string | undefined, user: JwtPayload): Promise<{ reply: string; threadId: string }> {
    try {
      const currentThreadId = threadId || randomUUID();
      const isNewConversation = !threadId;

      // Create session-specific tools with user context
      const sessionTools = [
        ...this.agentTools, 
        ...this.todoToolsService.createTools(user),
        ...this.memoryToolsService.createTools(user)
      ];

      // Get user memory context for new conversations
      let contextualSystemPrompt = this.SYSTEM_PROMPT;
      if (isNewConversation) {
        try {
          const userSummary = await this.memoryToolsService.getUserSummary(user.sub);
          if (userSummary.totalMemories > 0) {
            contextualSystemPrompt += `\n\n## Current User Context\n${userSummary.summary}\n\nUse this information to provide personalized responses. You can also search for more specific details using the memory tools when needed.`;
          }
          console.log(userSummary)
        } catch (error) {
          console.log('Failed to get user summary for context:', error);
        }
      }


      // Create agent with user context for this session
      const agentWithUserContext = createReactAgent({
        llm: this.agentModel,
        tools: sessionTools,
        checkpointSaver: this.agentCheckpointer,
        prompt: new SystemMessage(contextualSystemPrompt),
      });

      // Use the agent to get response
      const result = await agentWithUserContext.invoke(
        {
          messages: [{ content: message, role: 'user' }],
        },
        { configurable: { thread_id: currentThreadId } },
      );

      let reply = "Nessuna risposta ricevuta dall'agent.";

      if (result?.messages && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];

        if (lastMessage?.content) {
          if (typeof lastMessage.content === 'string') {
            reply = lastMessage.content;
          } else if (Array.isArray(lastMessage.content)) {
            const textContent = lastMessage.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join(' ');
            reply = textContent || 'Nessuna risposta testuale.';
          }
        }
      }

      // Update or create conversation in Mongoose
      await this.updateConversationInMongoose(currentThreadId, message, reply, user);

      // Extract and store memories from user message (async, non-blocking)
      this.extractMemoriesAsync(message, user, currentThreadId);

      return { reply, threadId: currentThreadId };
    } catch (e) {
      console.error("Errore durante la comunicazione con l'agent:", e);
      const generatedThreadId = threadId || randomUUID();
      return { reply: 'Errore durante la generazione della risposta.', threadId: generatedThreadId };
    }
  }

  private async updateConversationInMongoose(threadId: string, userMessage: string, agentReply: string, user: JwtPayload): Promise<void> {
    try {
      const existingConversation = await this.conversationModel.findOne({ threadId, userId: user.sub });

      if (existingConversation) {
        // Add new messages to existing conversation
        existingConversation.messages.push(
          { content: userMessage, role: 'user', timestamp: new Date() },
          { content: agentReply, role: 'assistant', timestamp: new Date() },
        );
        existingConversation.messageCount = existingConversation.messages.length;
        existingConversation.lastUpdated = new Date();
        await existingConversation.save();
      } else {
        // Generate description for new conversation
        const description = await this.generateConversationDescription(userMessage, agentReply);

        // Create new conversation
        const newConversation = new this.conversationModel({
          threadId,
          userId: user.sub,
          messages: [
            { content: userMessage, role: 'user', timestamp: new Date() },
            { content: agentReply, role: 'assistant', timestamp: new Date() },
          ],
          messageCount: 2,
          lastUpdated: new Date(),
          step: 1,
          description,
        });
        await newConversation.save();
      }
    } catch (error) {
      console.error('Error updating conversation in Mongoose:', error);
    }
  }

  private async extractMemoriesAsync(userMessage: string, user: JwtPayload, threadId: string): Promise<void> {
    try {
      // Only extract memories from substantial messages (more than 20 characters)
      if (userMessage.length < 20) {
        return;
      }

      // Extract memories from user message using service directly
      await this.memoryToolsService.extractMemoriesFromText(user.sub, userMessage, `conversation_${threadId}`);
    } catch (error) {
      console.error('Error extracting memories:', error);
      // Don't throw - memory extraction is non-critical
    }
  }

  private async generateConversationDescription(firstMessage: string, firstReply: string): Promise<string> {
    try {
      const descriptionPrompt = `Generate ONLY a brief description of maximum 10 words for this conversation in the same language as the messages. DO NOT add explanations or other text.
User message: "${firstMessage}"
Assistant reply: "${firstReply}"
Respond ONLY with the description, nothing else`;

      const result = await this.agentModel.invoke([{ content: descriptionPrompt, role: 'user' }]);

      let description = 'Conversazione generale';
      if (result?.content) {
        if (typeof result.content === 'string') {
          description = result.content.trim().substring(0, 255);
        } else if (Array.isArray(result.content)) {
          const textContent = result.content
            .filter((item: any) => item.type === 'text')
            .map((item: any) => item.text)
            .join(' ');
          description = textContent.trim().substring(0, 255) || 'Conversazione generale';
        }
      }

      return description;
    } catch (error) {
      console.error('Error generating conversation description:', error);
      return 'Conversazione generale';
    }
  }
}