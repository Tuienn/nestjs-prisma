import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS Prisma API')
    .setDescription('API documentation for the NestJS Prisma application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  Logger.log(
    'Swagger docs available at http://localhost:3000/docs',
    'Bootstrap',
  );

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // tự động loại bỏ field thừa
      forbidNonWhitelisted: true, // báo lỗi nếu client gửi field không mong muốn
      stopAtFirstError: true, // dừng validation sau lỗi đầu tiên
      forbidUnknownValues: true, // báo lỗi nếu giá trị undefined/null/rỗng
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors
            .map(
              (e) =>
                `${e.property} - ${Object.values(e.constraints!).join(', ')}`,
            )
            .join('; '),
        );
      },
    }),
  );

  Logger.log('Starting server on http://localhost:3000', 'Bootstrap');
  await app.listen(3000);
}
bootstrap();
