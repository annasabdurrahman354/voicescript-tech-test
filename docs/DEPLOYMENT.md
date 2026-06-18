# Deployment

## Build

```bash
npm run build       # tsc → dist/
npm start           # node dist/server.js
```

`dist/` contains the compiled CommonJS output. The `public/` folder and `prisma/` folder are intentionally copied alongside (Prisma migrates / seeds assume relative paths).

## Environment variables

All env vars are validated by Zod at startup in `src/config/env.ts`. Missing or malformed values will fail the process immediately.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | One of `development` \| `production` |
| `PORT` | no | `3000` | TCP port for the HTTP server |
| `DATABASE_URL` | **yes** | — | Database connection string (defaults to `file:./prisma/dev.db`) |

The provided `.env` (or `.env.example` template) should look like:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./prisma/dev.db
```

## Databases by Environment
The application resolves SQLite database files depending on the environment context:
- **Testing**: When running `npm run test`, the system automatically runs the test runner script (`scripts/run-tests.ts`), sets `DATABASE_URL` to `file:./prisma/test.db` and runs tests in isolation.
- **Development**: Reads from `DATABASE_URL` or defaults to `prisma/dev.db`.
- **Production**: If `NODE_ENV` is set to `production`, it defaults to `prisma/prod.db` (if `DATABASE_URL` is not custom-set).

## Switching to PostgreSQL

The default is SQLite (zero-config). To run against PostgreSQL:

1. **`prisma/schema.prisma`** — change the active `datasource db` block:

   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

   (Comment out the SQLite block.)

2. **`prisma.config.ts`** — comment out the SQLite `datasource.url` and uncomment the PG one:

   ```ts
   datasource: {
     url: process.env['DATABASE_URL'],
   },
   ```

3. **`.env`** — set:

   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

4. Re-generate and migrate:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

The rest of the codebase is provider-agnostic.

## Production checklist

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` points at a managed Postgres (or another durable store)
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Build emitted: `npm run build`
- [ ] Process manager / reverse proxy in front (pm2 / systemd / Docker / k8s)
- [ ] Swagger UI (`/api/docs`) is **only** exposed to internal networks unless you intend to share it publicly

## Behind a reverse proxy (nginx example)

```nginx
location / {
  proxy_pass         http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header   Host              $host;
  proxy_set_header   X-Real-IP         $remote_addr;
  proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header   X-Forwarded-Proto $scheme;
}
```

If you terminate TLS at the proxy, set `app.set('trust proxy', 1)` in `src/app.ts`.

## Docker (sketch)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npx prisma generate

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

## Health check

```bash
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}
```

Suitable as a load-balancer / k8s liveness probe.
