import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async healthPrisma() {
    try {
      // Ping MongoDB trực tiếp
      await this.prisma.$runCommandRaw({ ping: 1 });
      return { status: 'connected', db: 'MongoDB' };
    } catch (error: unknown) {
      return { status: 'disconnected', error: (error as Error).message };
    }
  }

  findall() {
    return this.prisma.user.findMany();
  }

  create(data: { name: string; email: string }) {
    return this.prisma.user.create({ data });
  }
}
