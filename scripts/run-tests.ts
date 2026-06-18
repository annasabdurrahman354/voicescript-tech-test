import { execSync } from 'child_process';

// Set environment variables for testing
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'file:./prisma/test.db';

console.log('🔄 Syncing Prisma schema with the test database...');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Test database schema is up to date.');
} catch (error) {
  console.error('❌ Failed to push schema to test database:', error);
  process.exit(1);
}

console.log('🧪 Running tests...');
try {
  execSync('npx vitest run', { stdio: 'inherit' });
  console.log('✅ All tests passed.');
} catch (error) {
  console.error('❌ Test execution failed.');
  process.exit(1);
}
