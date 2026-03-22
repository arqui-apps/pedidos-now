import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './config/swagger/swagger.config';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  configureSwagger(app);

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`business-service running on http://localhost:${port}/api`);
  console.log(`swagger available on http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
