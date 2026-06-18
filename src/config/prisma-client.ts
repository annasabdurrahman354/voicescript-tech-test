// src/config/prisma-client.ts
// Exports a single shared PrismaClient instance configured with the
// better-sqlite3 driver adapter (required by Prisma v7).
//
// In development, attached to `globalThis` to survive hot-reloading
// without opening multiple database connections.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Resolve the SQLite file path (default: local dev DB)
  const dbUrl = process.env['DATABASE_URL'] ?? 'file:./prisma/dev.db';

  // Strip the "file:" prefix that SQLite URLs use
  const dbPath = dbUrl.startsWith('file:') ? dbUrl.slice(5) : dbUrl;

  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Re-use the existing client in development (hot-reload safe)
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
