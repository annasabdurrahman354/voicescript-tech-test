import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },

  // SQLite
  datasource: {
    url: process.env['DATABASE_URL'] || 'file:./prisma/dev.db',
  },

  // PostgreSQL — uncomment to switch providers
  // Update prisma/schema.prisma datasource.provider to "postgresql" too.
  // datasource: {
  //   url: process.env['DATABASE_URL'],
  // },
});
