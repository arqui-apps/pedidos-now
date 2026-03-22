$ErrorActionPreference = "Stop"

$serviceRoot = "services/business-service"

if (Test-Path $serviceRoot) {
  Write-Error "La carpeta $serviceRoot ya existe."
  exit 1
}

New-Item -ItemType Directory -Force -Path "services" | Out-Null

Write-Host "==> Creando proyecto NestJS en services/business-service..."
Push-Location "services"
npx -y @nestjs/cli@latest new business-service --package-manager npm --skip-git --strict
Pop-Location

Push-Location $serviceRoot

Write-Host "==> Instalando dependencias base..."
npm install @nestjs/config @nestjs/swagger swagger-ui-express class-validator class-transformer joi dotenv @prisma/client@7.5.0
npm install --save-dev prisma@7.5.0 tsx

Write-Host "==> Creando estructura de carpetas..."

$directories = @(
  "src/config/env",
  "src/config/swagger",
  "src/config/database",
  "src/common/dto",
  "src/common/enums",
  "src/common/exceptions",
  "src/common/filters",
  "src/common/guards",
  "src/common/interceptors",
  "src/common/pipes",
  "src/common/utils",
  "src/health",
  "src/prisma",
  "src/modules/business/application",
  "src/modules/business/domain",
  "src/modules/business/infrastructure",
  "src/modules/business/presentation",
  "src/modules/schedules/application",
  "src/modules/schedules/domain",
  "src/modules/schedules/infrastructure",
  "src/modules/schedules/presentation",
  "src/modules/product-types/application",
  "src/modules/product-types/domain",
  "src/modules/product-types/infrastructure",
  "src/modules/product-types/presentation",
  "src/modules/products/application",
  "src/modules/products/domain",
  "src/modules/products/infrastructure",
  "src/modules/products/presentation",
  "src/modules/inventory/application",
  "src/modules/inventory/domain",
  "src/modules/inventory/infrastructure",
  "src/modules/inventory/presentation",
  "src/modules/orders/application",
  "src/modules/orders/domain",
  "src/modules/orders/infrastructure",
  "src/modules/orders/presentation",
  "src/modules/deliveries/application",
  "src/modules/deliveries/domain",
  "src/modules/deliveries/infrastructure",
  "src/modules/deliveries/presentation",
  "src/modules/delivery-fee-adjustments/application",
  "src/modules/delivery-fee-adjustments/domain",
  "src/modules/delivery-fee-adjustments/infrastructure",
  "src/modules/delivery-fee-adjustments/presentation",
  "src/modules/promotions/application",
  "src/modules/promotions/domain",
  "src/modules/promotions/infrastructure",
  "src/modules/promotions/presentation",
  "src/modules/metrics/application",
  "src/modules/metrics/domain",
  "src/modules/metrics/infrastructure",
  "src/modules/metrics/presentation",
  "src/modules/support/application",
  "src/modules/support/domain",
  "src/modules/support/infrastructure",
  "src/modules/support/presentation",
  "src/modules/internal/payments",
  "src/modules/internal/discounts",
  "src/modules/internal/delivery-flow",
  "src/modules/internal/administration",
  "prisma"
)

foreach ($dir in $directories) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "==> Eliminando archivos default de Nest que no usaremos..."
$filesToRemove = @(
  "src/app.controller.ts",
  "src/app.controller.spec.ts",
  "src/app.service.ts"
)

foreach ($file in $filesToRemove) {
  if (Test-Path $file) {
    Remove-Item $file -Force
  }
}

Write-Host "==> Creando archivos base..."

$mainTs = @'
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
  await prismaService.enableShutdownHooks(app);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`business-service running on http://localhost:${port}/api`);
  console.log(`swagger available on http://localhost:${port}/api/docs`);
}

bootstrap();
'@

$appModuleTs = @'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env/env.validation';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
'@

$envValidationTs = @'
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
});
'@

$swaggerConfigTs = @'
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Business Service API')
    .setDescription('API for the business-service microservice')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
'@

$healthControllerTs = @'
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      service: 'business-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
'@

$healthModuleTs = @'
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
'@

$prismaServiceTs = @'
import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
'@

$prismaModuleTs = @'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
'@

$prismaConfigTs = @'
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
'@

$prismaSchema = @'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
'@

$seedTs = @'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seed placeholder for business-service');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed finished');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
'@

$envExample = @'
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/business_service_db_v1"
'@

$readme = @'
# business-service

## local setup
1. copy `.env.example` to `.env`
2. update `DATABASE_URL`
3. run `npx prisma db pull`
4. run `npx prisma generate`
5. run `npm run start:dev`

## prisma scripts
- `npm run prisma:db:pull`
- `npm run prisma:generate`
- `npm run prisma:studio`
- `npm run prisma:seed`

## swagger
available at `/api/docs`

## health check
available at `/api/health`
'@

Set-Content -Path "src/main.ts" -Value $mainTs -Encoding UTF8
Set-Content -Path "src/app.module.ts" -Value $appModuleTs -Encoding UTF8
Set-Content -Path "src/config/env/env.validation.ts" -Value $envValidationTs -Encoding UTF8
Set-Content -Path "src/config/swagger/swagger.config.ts" -Value $swaggerConfigTs -Encoding UTF8
Set-Content -Path "src/health/health.controller.ts" -Value $healthControllerTs -Encoding UTF8
Set-Content -Path "src/health/health.module.ts" -Value $healthModuleTs -Encoding UTF8
Set-Content -Path "src/prisma/prisma.service.ts" -Value $prismaServiceTs -Encoding UTF8
Set-Content -Path "src/prisma/prisma.module.ts" -Value $prismaModuleTs -Encoding UTF8
Set-Content -Path "prisma.config.ts" -Value $prismaConfigTs -Encoding UTF8
Set-Content -Path "prisma/schema.prisma" -Value $prismaSchema -Encoding UTF8
Set-Content -Path "prisma/seed.ts" -Value $seedTs -Encoding UTF8
Set-Content -Path ".env.example" -Value $envExample -Encoding UTF8
Set-Content -Path "README.md" -Value $readme -Encoding UTF8

Write-Host "==> Actualizando package.json con scripts de Prisma..."
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

$packageJson.scripts | Add-Member -NotePropertyName "prisma:db:pull" -NotePropertyValue "prisma db pull" -Force
$packageJson.scripts | Add-Member -NotePropertyName "prisma:generate" -NotePropertyValue "prisma generate" -Force
$packageJson.scripts | Add-Member -NotePropertyName "prisma:studio" -NotePropertyValue "prisma studio" -Force
$packageJson.scripts | Add-Member -NotePropertyName "prisma:seed" -NotePropertyValue "prisma db seed" -Force

$packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath -Encoding UTF8

Write-Host "==> Creando archivos placeholder..."
Get-ChildItem "src/common" -Directory -Recurse | ForEach-Object {
  $gitkeep = Join-Path $_.FullName ".gitkeep"
  if (-not (Test-Path $gitkeep)) {
    New-Item -ItemType File -Path $gitkeep | Out-Null
  }
}

Get-ChildItem "src/modules" -Directory -Recurse | ForEach-Object {
  $gitkeep = Join-Path $_.FullName ".gitkeep"
  if (-not (Test-Path $gitkeep)) {
    New-Item -ItemType File -Path $gitkeep | Out-Null
  }
}

Pop-Location

Write-Host "==> Listo."
Write-Host "Siguientes pasos:"
Write-Host "1) cd services/business-service"
Write-Host "2) Copy-Item .env.example .env"
Write-Host "3) Editar DATABASE_URL"
Write-Host "4) npm run prisma:db:pull"
Write-Host "5) npm run prisma:generate"
Write-Host "6) npm run start:dev"