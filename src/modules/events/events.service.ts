import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/modules/email/email.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private notifications: NotificationsService,
  ) {}

  async findAll(query: { type?: string; isOnline?: boolean; dateFrom?: string }) {
    const where: any = { isPublished: true };
    if (query.type) where.type = query.type;
    if (query.isOnline !== undefined) where.isOnline = query.isOnline;
    if (query.dateFrom) where.startDate = { gte: new Date(query.dateFrom) };
    const items = await this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: 50,
    });
    return items;
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, isPublished: true },
      include: {
        _count: { select: { registrations: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return { ...event, registered: event._count.registrations };
  }

  async create(dto: any) {
    return this.prisma.event.create({ data: dto });
  }

  async register(userId: string, eventId: string) {
    const existing = await this.prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw new ConflictException('Already registered');

    const [event, user] = await Promise.all([
      this.prisma.event.findUniqueOrThrow({ where: { id: eventId } }),
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, firstName: true, id: true } }),
    ]);

    const reg = await this.prisma.eventRegistration.create({
      data: { userId, eventId },
    });

    // In-app notification
    await this.notifications.create(userId, {
      title: 'Event Registration Confirmed',
      body: `You are registered for ${event.title} on ${event.startDate.toLocaleDateString()}.`,
      type: 'event_registration',
      data: { eventId },
    });

    // Email confirmation
    this.email.sendEventRegistration(
      user.email,
      user.firstName,
      event.title,
      event.startDate.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
      event.location,
      event.isOnline,
    ).catch(() => null);

    return { registrationId: reg.id };
  }
}
