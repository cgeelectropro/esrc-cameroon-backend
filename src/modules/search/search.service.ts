import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

interface MeilisearchResponse<T> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  estimatedTotalHits?: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private meilisearchUrl: string;
  private meilisearchKey: string;
  private readonly logger = new Logger(SearchService.name);
  private indexes = {
    courses: 'courses',
    publications: 'publications',
    events: 'events',
    opportunities: 'opportunities',
  };

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.meilisearchUrl = this.config.get<string>('MEILISEARCH_HOST') || 'http://localhost:7700';
    this.meilisearchKey = this.config.get<string>('MEILISEARCH_API_KEY') || '';
  }

  async onModuleInit() {
    try {
      // Initialize indexes when module loads
      await this.initializeIndexes();
    } catch (error) {
      this.logger.warn('Failed to initialize Meilisearch indexes:', error);
    }
  }

  /**
   * Initialize Meilisearch indexes with proper settings
   */
  private async initializeIndexes() {
    try {
      // Create indexes if they don't exist
      for (const [key, indexName] of Object.entries(this.indexes)) {
        await this.createIndex(indexName);
      }
      this.logger.log('Meilisearch indexes initialized');
    } catch (error) {
      this.logger.warn('Index initialization skipped:', error);
    }
  }

  /**
   * Create index with configuration
   */
  private async createIndex(indexName: string): Promise<void> {
    try {
      const response = await fetch(`${this.meilisearchUrl}/indexes/${indexName}`, {
        headers: {
          'Authorization': `Bearer ${this.meilisearchKey}`,
        },
      });

      // If index exists (200) or conflict (409), it's fine
      if (response.status === 200 || response.status === 409) {
        return;
      }

      // Create new index
      await fetch(`${this.meilisearchUrl}/indexes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.meilisearchKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: indexName, primaryKey: 'id' }),
      });

      this.logger.log(`Created Meilisearch index: ${indexName}`);
    } catch (error) {
      this.logger.warn(`Failed to create index ${indexName}:`, error);
    }
  }

  /**
   * Search using Meilisearch or fallback to database
   */
  async search(
    q: string,
    type?: 'courses' | 'publications' | 'events' | 'opportunities',
    limit = 10,
  ): Promise<Record<string, unknown[]>> {
    try {
      // Try Meilisearch first if configured
      if (this.meilisearchUrl && this.meilisearchKey) {
        return await this.searchWithMeilisearch(q, type, limit);
      }

      // Fall back to database search
      return await this.searchWithDatabase(q, type, limit);
    } catch (error) {
      this.logger.warn('Search error, falling back to database:', error);
      return await this.searchWithDatabase(q, type, limit);
    }
  }

  /**
   * Search using Meilisearch API
   */
  private async searchWithMeilisearch(
    q: string,
    type?: string,
    limit = 10,
  ): Promise<Record<string, unknown[]>> {
    const results: Record<string, unknown[]> = {};

    const searchIndexes = type
      ? [type as keyof typeof this.indexes]
      : (Object.keys(this.indexes) as Array<keyof typeof this.indexes>);

    for (const indexKey of searchIndexes) {
      const indexName = this.indexes[indexKey];

      try {
        const response = await fetch(
          `${this.meilisearchUrl}/indexes/${indexName}/search`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.meilisearchKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q,
              limit,
              attributesToRetrieve: ['id', 'title', 'description', 'category', 'rating', 'url'],
            }),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as MeilisearchResponse<unknown>;
          results[indexKey] = data.hits;
        } else {
          // Index doesn't exist, try database
          results[indexKey] = await this.searchIndexInDatabase(indexKey as keyof typeof this.indexes, q, limit);
        }
      } catch (error) {
        this.logger.debug(`Meilisearch search failed for ${indexName}, using database:`, error);
        results[indexKey] = await this.searchIndexInDatabase(indexKey as keyof typeof this.indexes, q, limit);
      }
    }

    return results;
  }

  /**
   * Search using database directly
   */
  private async searchWithDatabase(
    q: string,
    type?: string,
    limit = 10,
  ): Promise<Record<string, unknown[]>> {
    const search = { contains: q, mode: 'insensitive' as const };
    const results: Record<string, unknown[]> = {};

    if (!type || type === 'courses') {
      results.courses = await this.searchIndexInDatabase('courses', q, limit);
    }

    if (!type || type === 'publications') {
      results.publications = await this.searchIndexInDatabase('publications', q, limit);
    }

    if (!type || type === 'events') {
      results.events = await this.searchIndexInDatabase('events', q, limit);
    }

    if (!type || type === 'opportunities') {
      results.opportunities = await this.searchIndexInDatabase('opportunities', q, limit);
    }

    return results;
  }

  /**
   * Search specific index in database
   */
  private async searchIndexInDatabase(
    indexKey: string,
    q: string,
    limit: number,
  ): Promise<unknown[]> {
    const search = { contains: q, mode: 'insensitive' as const };

    switch (indexKey) {
      case 'courses':
        return await this.prisma.course.findMany({
          where: {
            status: 'PUBLISHED' as any,
            OR: [{ title: search }, { description: search }],
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            avgRating: true,
            studentCount: true,
          },
          take: limit,
        });

      case 'publications':
        return await this.prisma.publication.findMany({
          where: {
            isApproved: true,
            OR: [{ title: search }, { abstract: search }],
          },
          select: {
            id: true,
            title: true,
            abstract: true,
            publishedAt: true,
          },
          take: limit,
        });

      case 'events':
        return await this.prisma.event.findMany({
          where: {
            isPublished: true,
            OR: [{ title: search }, { description: search }],
          },
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
          },
          take: limit,
        });

      case 'opportunities':
        return await this.prisma.opportunity.findMany({
          where: {
            isApproved: true,
            OR: [{ title: search }, { description: search }],
          },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            deadline: true,
          },
          take: limit,
        });

      default:
        return [];
    }
  }

  /**
   * Index documents in Meilisearch
   */
  async indexDocuments(indexKey: string, documents: Array<Record<string, unknown>>): Promise<void> {
    if (!this.meilisearchUrl || !this.meilisearchKey || documents.length === 0) {
      return;
    }

    try {
      const indexName = this.indexes[indexKey as keyof typeof this.indexes];
      if (!indexName) return;

      const response = await fetch(`${this.meilisearchUrl}/indexes/${indexName}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.meilisearchKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documents),
      });

      if (!response.ok) {
        throw new Error(`Failed to index documents: ${response.statusText}`);
      }

      this.logger.log(`Indexed ${documents.length} documents in ${indexName}`);
    } catch (error) {
      this.logger.warn(`Failed to index documents in Meilisearch:`, error);
      // Don't throw - gracefully handle Meilisearch unavailability
    }
  }

  /**
   * Delete document from index
   */
  async deleteDocument(indexKey: string, documentId: string): Promise<void> {
    if (!this.meilisearchUrl || !this.meilisearchKey) {
      return;
    }

    try {
      const indexName = this.indexes[indexKey as keyof typeof this.indexes];
      if (!indexName) return;

      await fetch(`${this.meilisearchUrl}/indexes/${indexName}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.meilisearchKey}`,
        },
      });

      this.logger.log(`Deleted document ${documentId} from ${indexName}`);
    } catch (error) {
      this.logger.warn(`Failed to delete document from Meilisearch:`, error);
    }
  }

  /**
   * Get search health status
   */
  async getHealth(): Promise<{ status: 'healthy' | 'unavailable'; message: string }> {
    try {
      const response = await fetch(`${this.meilisearchUrl}/health`);
      if (response.ok) {
        return { status: 'healthy', message: 'Meilisearch is running' };
      }
      return { status: 'unavailable', message: 'Meilisearch health check failed' };
    } catch (error) {
      return { status: 'unavailable', message: 'Meilisearch is unavailable' };
    }
  }
}
