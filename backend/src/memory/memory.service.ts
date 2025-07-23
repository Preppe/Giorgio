import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/qdrant-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from '../s3/s3.service';

export enum MemoryCategory {
  PERSONAL = 'personal',
  PREFERENCES = 'preferences',
  WORK = 'work',
  RELATIONSHIPS = 'relationships',
  GOALS = 'goals',
  OTHER = 'other',
}

export interface StoreMemoryDto {
  content: string;
  category?: MemoryCategory;
  importance?: number;
  source?: string;
}

export interface SearchMemoryDto {
  query: string;
  limit?: number;
  category?: MemoryCategory;
  threshold?: number;
}

export interface MemoryResponseDto {
  id: string;
  content: string;
  category: MemoryCategory;
  importance: number;
  source?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchMemoryResponseDto {
  memories: MemoryResponseDto[];
  totalCount: number;
  query: string;
}

export interface UserSummaryDto {
  userId: string;
  summary: string;
  totalMemories: number;
  categories: { [key in MemoryCategory]?: number };
  lastUpdated: Date;
}

@Injectable()
export class MemoryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MemoryService.name);
  private qdrantClient: QdrantClient;
  private genAI: GoogleGenerativeAI;
  private readonly cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(private readonly s3Service: S3Service) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async onModuleInit() {
    this.qdrantClient = new QdrantClient({
      host: process.env.QDRANT_HOST || 'localhost',
      port: parseInt(process.env.QDRANT_PORT || '6333'),
    });

    this.logger.log('MemoryService initialized');
  }

  async onModuleDestroy() {
    this.logger.log('MemoryService destroyed');
  }

  private getCollectionName(userId: string): string {
    return `user_memories_${userId}`;
  }

  private getCacheFileKey(userId: string): string {
    return `user-summaries/${userId}.md`;
  }

  private async ensureCollectionExists(userId: string): Promise<void> {
    const collectionName = this.getCollectionName(userId);

    try {
      await this.qdrantClient.getCollection(collectionName);
    } catch (error) {
      this.logger.log(`Creating collection: ${collectionName}`);
      await this.qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 3072, // Gemini text-embedding-004 dimension
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      throw new Error('Failed to generate embedding');
    }
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheFileKey(userId);
      await this.s3Service.deleteFile({ key: cacheKey });
      this.logger.log(`Cache invalidated for user: ${userId}`);
    } catch (error) {
      // File might not exist, which is fine
    }
  }

  private async isCacheValid(userId: string): Promise<boolean> {
    try {
      const cacheKey = this.getCacheFileKey(userId);
      
      // Check if file exists and get its metadata
      const objects = await this.s3Service.listObjects({ 
        prefix: cacheKey,
        maxKeys: 1 
      });
      
      if (objects.objects.length === 0) {
        return false;
      }
      
      const fileLastModified = objects.objects[0].lastModified;
      const ageMs = Date.now() - fileLastModified.getTime();
      return ageMs < this.cacheTTL;
    } catch (error) {
      return false;
    }
  }

  private async readCacheFile(userId: string): Promise<UserSummaryDto | null> {
    try {
      const cacheKey = this.getCacheFileKey(userId);
      const buffer = await this.s3Service.downloadFile({ key: cacheKey });
      const content = buffer.toString('utf-8');

      // Parse markdown content
      const lines = content.split('\n');
      const summaryStartIndex = lines.findIndex((line) => line.startsWith('## Summary')) + 1;
      const statsStartIndex = lines.findIndex((line) => line.startsWith('## Stats'));

      if (summaryStartIndex === 0 || statsStartIndex === -1) {
        return null;
      }

      const summary = lines.slice(summaryStartIndex, statsStartIndex).join('\n').trim();

      // Extract stats
      const statsLines = lines.slice(statsStartIndex + 1);
      const totalMemoriesLine = statsLines.find((line) => line.includes('Total Memories:'));
      const totalMemories = totalMemoriesLine ? parseInt(totalMemoriesLine.split(':')[1].trim()) : 0;

      const categoriesLine = statsLines.find((line) => line.includes('Categories:'));
      const categories = categoriesLine ? JSON.parse(categoriesLine.split('Categories:')[1].trim()) : {};

      return {
        userId,
        summary,
        totalMemories,
        categories,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.warn('Failed to read cache file:', error);
      return null;
    }
  }

  private async writeCacheFile(userId: string, userSummary: UserSummaryDto): Promise<void> {
    try {
      const cacheKey = this.getCacheFileKey(userId);
      const content = `# User Summary - ${userId}
Last Updated: ${new Date().toISOString()}

## Summary
${userSummary.summary}

## Stats
- Total Memories: ${userSummary.totalMemories}
- Categories: ${JSON.stringify(userSummary.categories)}
`;

      const buffer = Buffer.from(content, 'utf-8');
      await this.s3Service.uploadFile(buffer, {
        key: cacheKey,
        contentType: 'text/markdown',
      });
      this.logger.log(`Cache updated for user: ${userId}`);
    } catch (error) {
      this.logger.warn('Failed to write cache file:', error);
    }
  }

  async storeMemory(userId: string, memoryDto: StoreMemoryDto): Promise<MemoryResponseDto> {
    await this.ensureCollectionExists(userId);

    const memoryId = uuidv4();
    const collectionName = this.getCollectionName(userId);
    const now = new Date();

    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(memoryDto.content);

      // Store in Qdrant with all metadata in payload
      await this.qdrantClient.upsert(collectionName, {
        wait: true,
        points: [
          {
            id: memoryId,
            vector: embedding,
            payload: {
              content: memoryDto.content,
              category: memoryDto.category || MemoryCategory.OTHER,
              importance: memoryDto.importance || 5,
              source: memoryDto.source || 'manual',
              userId,
              createdAt: now.toISOString(),
              lastAccessed: now.toISOString(),
              accessCount: 0,
            },
          },
        ],
      });

      // Invalidate user cache since we added new memory
      await this.invalidateUserCache(userId);

      return {
        id: memoryId,
        content: memoryDto.content,
        category: memoryDto.category || MemoryCategory.OTHER,
        importance: memoryDto.importance || 5,
        source: memoryDto.source,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error('Error storing memory', error);
      throw new Error('Failed to store memory');
    }
  }

  async searchMemories(userId: string, searchDto: SearchMemoryDto): Promise<SearchMemoryResponseDto> {
    const collectionName = this.getCollectionName(userId);

    try {
      await this.ensureCollectionExists(userId);

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(searchDto.query);

      // Search in Qdrant
      const searchResults = await this.qdrantClient.search(collectionName, {
        vector: queryEmbedding,
        limit: searchDto.limit || 10,
        score_threshold: searchDto.threshold || 0.7,
        filter: searchDto.category
          ? {
              must: [{ key: 'category', match: { value: searchDto.category } }],
            }
          : undefined,
      });

      const memories: MemoryResponseDto[] = searchResults.map((result) => ({
        id: result.id as string,
        content: (result.payload?.content as string) || '',
        category: (result.payload?.category as MemoryCategory) || MemoryCategory.OTHER,
        importance: (result.payload?.importance as number) || 5,
        source: result.payload?.source as string,
        score: result.score,
        createdAt: new Date((result.payload?.createdAt as string) || Date.now()),
        updatedAt: new Date((result.payload?.createdAt as string) || Date.now()),
      }));

      return {
        memories,
        totalCount: memories.length,
        query: searchDto.query,
      };
    } catch (error) {
      this.logger.error('Error searching memories', error);
      return {
        memories: [],
        totalCount: 0,
        query: searchDto.query,
      };
    }
  }

  async getUserSummary(userId: string): Promise<UserSummaryDto> {
    try {
      // Check if cache is valid
      if (await this.isCacheValid(userId)) {
        const cachedSummary = await this.readCacheFile(userId);
        if (cachedSummary) {
          this.logger.log(`Using cached summary for user: ${userId}`);
          return cachedSummary;
        }
      }

      // Cache miss or invalid, generate from Qdrant
      const collectionName = this.getCollectionName(userId);
      await this.ensureCollectionExists(userId);

      // Get all memories for user, sorted by importance
      const allMemories = await this.qdrantClient.scroll(collectionName, {
        limit: 100, // Reasonable limit
        with_payload: true,
      });

      if (!allMemories.points || allMemories.points.length === 0) {
        const emptySummary = {
          userId,
          summary: 'Nessuna informazione memorizzata per questo utente.',
          totalMemories: 0,
          categories: {},
          lastUpdated: new Date(),
        };

        await this.writeCacheFile(userId, emptySummary);
        return emptySummary;
      }

      // Sort by importance and creation date
      const sortedMemories = allMemories.points.sort((a, b) => {
        const importanceA = (a.payload?.importance as number) || 5;
        const importanceB = (b.payload?.importance as number) || 5;
        if (importanceA !== importanceB) {
          return importanceB - importanceA; // Higher importance first
        }
        const dateA = new Date((a.payload?.createdAt as string) || 0);
        const dateB = new Date((b.payload?.createdAt as string) || 0);
        return dateB.getTime() - dateA.getTime(); // More recent first
      });

      // Generate summary from top memories
      const topMemories = sortedMemories.slice(0, 15);
      const memoryTexts = topMemories.map((m) => `${m.payload?.category}: ${m.payload?.content}`).join('\n');

      const summaryPrompt = `Crea un breve riassunto delle informazioni chiave su questo utente basandoti sulle seguenti memorie. Rispondi solo con il riassunto, massimo 3-4 frasi:\n\n${memoryTexts}`;

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(summaryPrompt);
      const summary = result.response.text();

      // Count by categories
      const categories = sortedMemories.reduce(
        (acc, memory) => {
          const category = (memory.payload?.category as MemoryCategory) || MemoryCategory.OTHER;
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {} as { [key in MemoryCategory]?: number },
      );

      const userSummary: UserSummaryDto = {
        userId,
        summary,
        totalMemories: sortedMemories.length,
        categories,
        lastUpdated: new Date(),
      };

      // Cache the result
      await this.writeCacheFile(userId, userSummary);

      return userSummary;
    } catch (error) {
      this.logger.error('Error generating user summary', error);
      return {
        userId,
        summary: 'Errore nella generazione del riassunto utente.',
        totalMemories: 0,
        categories: {},
        lastUpdated: new Date(),
      };
    }
  }

  async deleteMemory(userId: string, memoryId: string): Promise<{ success: boolean; message: string }> {
    try {
      const collectionName = this.getCollectionName(userId);

      // Delete from Qdrant
      await this.qdrantClient.delete(collectionName, {
        wait: true,
        points: [memoryId],
      });

      // Invalidate user cache
      await this.invalidateUserCache(userId);

      return { success: true, message: 'Memoria eliminata con successo' };
    } catch (error) {
      this.logger.error('Error deleting memory', error);
      return { success: false, message: "Errore nell'eliminazione della memoria" };
    }
  }

  async extractMemoriesFromText(userId: string, text: string, source?: string): Promise<MemoryResponseDto[]> {
    try {
      const extractionPrompt = `Analizza il seguente testo e estrai informazioni rilevanti sull'utente che potrebbero essere utili da ricordare in future conversazioni. 
      
Cerca informazioni come:
- Nome, età, professione
- Preferenze e interessi
- Obiettivi e progetti
- Relazioni importanti
- Fatti personali significativi

Rispondi in formato JSON array con oggetti che hanno:
- content: l'informazione estratta (frase completa)
- category: una delle seguenti: personal, preferences, work, relationships, goals, other
- importance: numero da 1 a 10

Testo da analizzare:
${text}

Estrai solo informazioni concrete e specifiche. Se non trovi informazioni rilevanti, rispondi con un array vuoto.`;

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(extractionPrompt);
      const responseText = result.response.text();

      // Parse JSON response
      let extractedInfos: Array<{ content: string; category: string; importance: number }> = [];
      try {
        const cleanedResponse = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        extractedInfos = JSON.parse(cleanedResponse);
      } catch (parseError) {
        this.logger.warn('Failed to parse extraction response as JSON', parseError);
        return [];
      }

      if (!Array.isArray(extractedInfos) || extractedInfos.length === 0) {
        return [];
      }

      // Store extracted memories
      const storedMemories: MemoryResponseDto[] = [];
      for (const info of extractedInfos) {
        if (info.content && info.content.trim().length > 10) {
          try {
            const memoryDto: StoreMemoryDto = {
              content: info.content,
              category: (info.category as MemoryCategory) || MemoryCategory.OTHER,
              importance: Math.max(1, Math.min(10, info.importance || 5)),
              source: source || 'conversation',
            };

            const storedMemory = await this.storeMemory(userId, memoryDto);
            storedMemories.push(storedMemory);
          } catch (storeError) {
            this.logger.warn('Failed to store extracted memory', storeError);
          }
        }
      }

      return storedMemories;
    } catch (error) {
      this.logger.error('Error extracting memories from text', error);
      return [];
    }
  }
}
