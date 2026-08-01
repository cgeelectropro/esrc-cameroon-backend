import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PublicationType } from '@prisma/client';
import { ResearchFilterDto } from './dto/research-filter.dto';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ResearchFilterDto) {
    const where: { isApproved: boolean; type?: PublicationType; title?: object } = { isApproved: true };
    if (query.type) where.type = query.type as PublicationType;
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.publication.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const pub = await this.prisma.publication.findFirst({ where: { id, isApproved: true } });
    if (!pub) throw new NotFoundException('Publication not found');
    return pub;
  }

  async create(dto: CreatePublicationDto) {
    return this.prisma.publication.create({
      data: {
        title: dto.title,
        titleFr: dto.titleFr,
        abstract: dto.abstract,
        authors: dto.authors ?? [],
        type: dto.type as PublicationType,
        fileUrl: dto.fileUrl,
        doi: dto.doi,
        tags: dto.tags ?? [],
        sdgGoals: dto.sdgGoals ?? [],
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      },
    });
  }

  async update(id: string, dto: Partial<CreatePublicationDto>) {
    const { type, publishedAt, authors, tags, sdgGoals, ...rest } = dto as any;
    return this.prisma.publication.update({
      where: { id },
      data: {
        ...rest,
        ...(type && { type: type as PublicationType }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        ...(authors !== undefined && { authors }),
        ...(tags !== undefined && { tags }),
        ...(sdgGoals !== undefined && { sdgGoals }),
      },
    });
  }

  async incrementDownload(id: string) {
    const pub = await this.prisma.publication.findFirstOrThrow({ where: { id } });
    await this.prisma.publication.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    return { fileUrl: pub.fileUrl };
  }
}
