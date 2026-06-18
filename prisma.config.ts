import 'dotenv/config';
import { defineConfig } from 'prisma/config';

let dbUrl = process.env['DATABASE_URL'] || 'file:./prisma/dev.db';

if (dbUrl === 'file:./prisma/dev.db') {
  if (process.env['NODE_ENV'] === 'production') {
    dbUrl = 'file:./prisma/prod.db';
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },

  // SQLite
  datasource: {
    url: dbUrl,
  },

  // PostgreSQL — uncomment to switch providers
  // Update prisma/schema.prisma datasource.provider to "postgresql" too.
  // datasource: {
  //   url: process.env['DATABASE_URL'],
  // },
});
