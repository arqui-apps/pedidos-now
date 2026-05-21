import { business_schedule_day_of_week } from '@prisma/client';

export const SCHEDULE_DAY_ORDER: Record<business_schedule_day_of_week, number> =
  {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };
