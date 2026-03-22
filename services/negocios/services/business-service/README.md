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
