## Local quick start (project-specific)

Follow these steps to run this NestJS + Prisma microservice locally.

- **Create environment file**: add a `.env` with a `DATABASE_URL` for your Postgres (see `config/envs.ts` for expected keys).
- **Install deps**:

```bash
pnpm install
```

- **Generate Prisma client** (regenerates only if needed):

```bash
npx prisma generate
```

- **Run migrations (dev)** — this will apply migrations and create the database schema locally:

```bash
npx prisma migrate dev
```

- **Start the app in watch mode**:

```bash
pnpm run start:dev
```

- The server entrypoint is `src/main.ts`. The products module lives in `src/products`.