// prisma/seed.ts
// Seeds the database with sample reporters and editors for testing/demo purposes.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Prisma v7: requires a driver adapter
const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing seed data so this script is idempotent
  await prisma.payment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.reporter.deleteMany();
  await prisma.editor.deleteMany();

  // ── Reporters ──────────────────────────────────────────────────────────────
  const reporters = await prisma.reporter.createMany({
    data: [
      { name: 'Alice Hartman', city: 'Jakarta', available: true, ratePerMinute: 2000 },
      { name: 'Bob Santoso', city: 'Jakarta', available: true, ratePerMinute: 2200 },
      { name: 'Carol Dewi', city: 'Surabaya', available: true, ratePerMinute: 1800 },
      { name: 'David Kusuma', city: 'Bandung', available: false, ratePerMinute: 2000 },
      { name: 'Eve Rahardjo', city: 'Surabaya', available: true, ratePerMinute: 1900 },
    ],
  });

  // ── Editors ────────────────────────────────────────────────────────────────
  const editors = await prisma.editor.createMany({
    data: [
      { name: 'Frank Wijaya', available: true, flatFee: 50000 },
      { name: 'Grace Lim', available: true, flatFee: 60000 },
      { name: 'Henry Tan', available: false, flatFee: 45000 },
    ],
  });

  console.log(`✅ Created ${reporters.count} reporters and ${editors.count} editors.`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
