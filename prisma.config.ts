// prisma.config.ts
// Prisma v7 configuration file.
// In Prisma v7, ALL connection URLs must be defined here — not in schema.prisma.

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },

  // ── Database connection ────────────────────────────────────────────────────
  // SQLite (default — no server needed, great for local dev/testing)
  datasource: {
    url: 'file:./prisma/dev.db',
  },

  // ── PostgreSQL — uncomment to switch providers ─────────────────────────────
  // Update prisma/schema.prisma datasource.provider to "postgresql" too.
  // datasource: {
  //   url: process.env['DATABASE_URL'],
  // },
});
