import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { MemoryService, MemoryCategory } from '../../memory/memory.service';
import { JwtPayload } from '../../auth/types/jwt.types';

@Injectable()
export class MemoryToolsService {
  constructor(private readonly memoryService: MemoryService) {}

  createTools(user: JwtPayload) {
    const storeMemoryTool = new DynamicStructuredTool({
      name: 'store_memory',
      description: 'Store important information about the user for future reference',
      schema: z.object({
        content: z.string().describe('The information to store about the user'),
        category: z.enum(['personal', 'preferences', 'work', 'relationships', 'goals', 'other']).describe('Category of the information'),
        importance: z.number().min(1).max(10).describe('Importance level from 1 to 10'),
        source: z.string().optional().describe('Source of the information (e.g., conversation, profile)'),
      }),
      func: async ({ content, category, importance, source }: { 
        content: string; 
        category: MemoryCategory; 
        importance: number;
        source?: string;
      }) => {
        try {
          if (!content.trim()) {
            return '❌ Errore: il contenuto della memoria è obbligatorio';
          }

          const memory = await this.memoryService.storeMemory(user.sub, {
            content: content.trim(),
            category,
            importance: Math.max(1, Math.min(10, importance)),
            source: source || 'conversation',
          });

          return `✅ Memoria salvata con successo!\n📝 **${memory.content}**\n🏷️ Categoria: ${memory.category}\n⭐ Importanza: ${memory.importance}/10\nID: ${memory.id}`;
        } catch (error) {
          return `❌ Errore nel salvataggio della memoria: ${error.message}`;
        }
      },
    });

    const searchMemoryTool = new DynamicStructuredTool({
      name: 'search_memory',
      description: 'AUTOMATICALLY search for stored information about the user. Use this tool proactively when the user asks questions that might relate to their personal information, preferences, or past conversations. Examples: when user asks about their name, preferences, work, family, goals, etc.',
      schema: z.object({
        query: z.string().describe('Search query to find relevant information about the user (extract key terms from user question)'),
        limit: z.number().min(1).max(20).optional().describe('Maximum number of results to return (default: 5)'),
        category: z.enum(['personal', 'preferences', 'work', 'relationships', 'goals', 'other']).optional().describe('Filter by specific category if relevant'),
        threshold: z.number().min(0).max(1).optional().describe('Minimum similarity threshold (default: 0.6 for broader search)'),
      }),
      func: async ({ query, limit, category, threshold }: { 
        query: string; 
        limit?: number;
        category?: MemoryCategory;
        threshold?: number;
      }) => {
        try {
          if (!query.trim()) {
            return '❌ Query di ricerca vuota';
          }

          const searchResult = await this.memoryService.searchMemories(user.sub, {
            query: query.trim(),
            limit: limit || 5,
            category,
            threshold: threshold || 0.6, // Lower threshold for broader search
          });

          if (searchResult.memories.length === 0) {
            return `🔍 Nessuna informazione trovata per la query: "${query}"`;
          }

          const formattedMemories = searchResult.memories
            .map((memory, index) => {
              const scoreInfo = memory.score ? ` (similarità: ${(memory.score * 100).toFixed(1)}%)` : '';
              const categoryInfo = memory.category ? ` 🏷️ ${memory.category}` : '';
              const importanceInfo = `⭐ ${memory.importance}/10`;
              
              return `${index + 1}. **${memory.content}**${scoreInfo}\n   ${categoryInfo} | ${importanceInfo} | 📅 ${memory.createdAt.toLocaleDateString('it-IT')}`;
            })
            .join('\n\n');

          return `🧠 Informazioni trovate per "${query}" (${searchResult.totalCount} risultati):\n\n${formattedMemories}`;
        } catch (error) {
          return `❌ Errore nella ricerca delle memorie: ${error.message}`;
        }
      },
    });

    const getUserSummaryTool = new DynamicStructuredTool({
      name: 'get_user_summary',
      description: 'Get a comprehensive summary of what is known about the user',
      schema: z.object({
        request: z.string().describe('Request for user summary (any text)'),
      }),
      func: async (_: { request: string }) => {
        try {
          const summary = await this.memoryService.getUserSummary(user.sub);

          if (summary.totalMemories === 0) {
            return '📝 Non ho ancora memorizzato informazioni specifiche su di te. Durante le nostre conversazioni, raccoglierò e salverò informazioni importanti per offrirti un servizio più personalizzato.';
          }

          const categoriesInfo = Object.entries(summary.categories)
            .map(([category, count]) => `${category}: ${count}`)
            .join(', ');

          return `👤 **Riassunto utente**\n\n${summary.summary}\n\n📊 **Statistiche memorie:**\n- Totale informazioni: ${summary.totalMemories}\n- Categorie: ${categoriesInfo}\n- Ultimo aggiornamento: ${summary.lastUpdated.toLocaleDateString('it-IT')}`;
        } catch (error) {
          return `❌ Errore nel recupero del riassunto utente: ${error.message}`;
        }
      },
    });

    const extractMemoriesFromTextTool = new DynamicStructuredTool({
      name: 'extract_memories_from_text',
      description: 'Extract and store important user information from conversation text',
      schema: z.object({
        text: z.string().describe('Text from which to extract user information'),
        source: z.string().optional().describe('Source of the text (e.g., conversation, profile)'),
      }),
      func: async ({ text, source }: { text: string; source?: string }) => {
        try {
          if (!text.trim()) {
            return '❌ Testo vuoto fornito per l\'estrazione';
          }

          const extractedMemories = await this.memoryService.extractMemoriesFromText(
            user.sub, 
            text.trim(), 
            source || 'conversation'
          );

          if (extractedMemories.length === 0) {
            return '📝 Nessuna nuova informazione significativa estratta dal testo.';
          }

          const memoriesInfo = extractedMemories
            .map((memory, index) => 
              `${index + 1}. **${memory.content}** (${memory.category}, ⭐${memory.importance}/10)`
            )
            .join('\n');

          return `🧠 Estratte e salvate ${extractedMemories.length} nuove informazioni:\n\n${memoriesInfo}`;
        } catch (error) {
          return `❌ Errore nell'estrazione delle memorie: ${error.message}`;
        }
      },
    });

    return [storeMemoryTool, searchMemoryTool, getUserSummaryTool, extractMemoriesFromTextTool];
  }

  async extractMemoriesFromText(userId: string, text: string, source?: string): Promise<string> {
    try {
      const extractedMemories = await this.memoryService.extractMemoriesFromText(userId, text, source);
      
      if (extractedMemories.length === 0) {
        return 'Nessuna nuova informazione significativa estratta dal testo.';
      }

      const memoriesInfo = extractedMemories
        .map((memory, index) => 
          `${index + 1}. **${memory.content}** (${memory.category}, ⭐${memory.importance}/10)`
        )
        .join('\n');

      return `Estratte e salvate ${extractedMemories.length} nuove informazioni:\n\n${memoriesInfo}`;
    } catch (error) {
      return `Errore nell'estrazione delle memorie: ${error.message}`;
    }
  }

  async getUserSummary(userId: string) {
    return this.memoryService.getUserSummary(userId);
  }
}