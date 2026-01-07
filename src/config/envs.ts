import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .nonempty('PORT is required')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: 'PORT must be a valid number',
    })
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),
  DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
  NATS_SERVERS: z
    .string()
    .nonempty('NATS_SERVERS is required')
    .transform((val) => val.split(',')),
});

export const envs = envSchema.parse(process.env);
