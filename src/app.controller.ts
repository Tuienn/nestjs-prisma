import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/prisma')
  healthPrisma() {
    return this.appService.healthPrisma();
  }

  @Get('users')
  findAll() {
    return this.appService.findall();
  }

  @Post('users')
  create(@Body() data: { name: string; email: string }) {
    return this.appService.create(data);
  }
}
