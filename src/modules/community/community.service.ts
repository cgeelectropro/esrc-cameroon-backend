import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/modules/email/email.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private notifications: NotificationsService,
  ) {}

  async getForumPosts(query: { category?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (query.category) where.category = query.category;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [items, total] = await Promise.all([
      this.prisma.forumPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.forumPost.count({ where }),
    ]);
    return items.map((p) => ({
      ...p,
      pinned: p.isPinned,
      views: p.viewCount,
      likes: p.likeCount,
      author: `${p.user.firstName} ${p.user.lastName}`,
      replies: p._count.replies,
    }));
  }

  async getForumPost(id: string) {
    const post = await this.prisma.forumPost.findFirstOrThrow({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        replies: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    const normalizedPost = {
      ...post,
      pinned: post.isPinned,
      views: post.viewCount,
      likes: post.likeCount,
      author: `${post.user.firstName} ${post.user.lastName}`,
    };
    const normalizedReplies = post.replies.map((r) => ({
      ...r,
      likes: r.likeCount,
      author: `${r.user.firstName} ${r.user.lastName}`,
    }));
    return { post: normalizedPost, replies: normalizedReplies };
  }

  async createPost(userId: string, dto: { title: string; content: string; category: string }) {
    return this.prisma.forumPost.create({
      data: { userId, ...dto },
    });
  }

  async reply(postId: string, userId: string, content: string) {
    const [reply, post, replier] = await Promise.all([
      this.prisma.forumReply.create({ data: { postId, userId, content } }),
      this.prisma.forumPost.findUnique({ where: { id: postId }, select: { userId: true, title: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } }),
    ]);

    // Notify the post author (not themselves)
    if (post && post.userId !== userId) {
      const postAuthor = await this.prisma.user.findUnique({ where: { id: post.userId }, select: { email: true, firstName: true } });
      const replierName = replier ? `${replier.firstName} ${replier.lastName}` : 'Someone';

      this.notifications.create(post.userId, {
        title: 'New reply on your post',
        body: `${replierName} replied to your post: "${post.title}"`,
        type: 'forum_reply',
        data: { postId },
      }).catch(() => null);

      if (postAuthor) {
        this.email.sendForumReplyNotification(postAuthor.email, postAuthor.firstName, post.title, replierName, postId).catch(() => null);
      }
    }

    return reply;
  }

  async adminGetForumPosts(query: { category?: string; page?: string; limit?: string; search?: string }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.forumPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
          _count: { select: { replies: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.forumPost.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async adminUpdateForumPost(id: string, dto: { isPinned?: boolean; category?: string }) {
    return this.prisma.forumPost.update({ where: { id }, data: dto });
  }

  async adminDeleteForumPost(id: string) {
    await this.prisma.forumReply.deleteMany({ where: { postId: id } });
    return this.prisma.forumPost.delete({ where: { id } });
  }

  async adminDeleteForumReply(id: string) {
    return this.prisma.forumReply.delete({ where: { id } });
  }
}
