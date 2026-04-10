import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está definida');
  }

  const url = new URL(databaseUrl);

  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectTimeout: 5000,
    idleTimeout: 300,
  });
}

const prisma = new PrismaClient({
  adapter: createAdapter(),
});

async function main() {
  const schedules = [
    { day: 0, start: '07:00:00', end: '23:59:59' },
    { day: 1, start: '07:00:00', end: '23:59:59' },
    { day: 2, start: '07:00:00', end: '23:59:59' },
    { day: 3, start: '07:00:00', end: '23:59:59' },
    { day: 4, start: '07:00:00', end: '23:59:59' },
    { day: 5, start: '07:00:00', end: '23:59:59' },
    { day: 6, start: '07:00:00', end: '23:59:59' },
  ];

  for (const item of schedules) {
    await prisma.chat_availability.upsert({
      where: {
        active_day_of_week: item.day,
      },
      update: {
        day_of_week: item.day,
        start_time: new Date(`1970-01-01T${item.start}.000Z`),
        end_time: new Date(`1970-01-01T${item.end}.000Z`),
        enabled: true,
        timezone: 'America/Guatemala',
        deleted_at: null,
      },
      create: {
        day_of_week: item.day,
        start_time: new Date(`1970-01-01T${item.start}.000Z`),
        end_time: new Date(`1970-01-01T${item.end}.000Z`),
        enabled: true,
        timezone: 'America/Guatemala',
      },
    });
  }

  console.log('Horarios cargados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });