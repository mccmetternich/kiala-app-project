const { initDb } = require('../src/lib/db-enhanced.ts');

console.log('Running database migration...');
initDb();
console.log('Database migration complete.');
