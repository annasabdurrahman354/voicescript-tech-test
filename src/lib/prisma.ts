
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from '../config/env';

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const dbUrl = env.DATABASE_URL ?? 'file:./prisma/dev.db';
  const dbPath = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl;
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Single shared PrismaClient instance configured with the SQLite adapter.
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
