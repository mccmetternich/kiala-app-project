import pkg from '../src/lib/db-enhanced.ts';
const { initDb } = pkg;

console.log('Running database migration...');
initDb();
console.log('Database migration complete.');