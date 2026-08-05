// Diagnostic probe: verifies MongoDB connectivity and reports collection counts.
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewelry_management';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('MONGO: CONNECTED ->', mongoose.connection.host + '/' + mongoose.connection.name);

  const cols = await mongoose.connection.db.listCollections().toArray();
  if (cols.length === 0) {
    console.log('collections: (none - database is empty)');
  }
  for (const c of cols) {
    const n = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log('  ' + c.name + ': ' + n + ' docs');
  }

  await mongoose.connection.close();
} catch (e) {
  console.log('MONGO: FAILED ->', String(e.message).split('\n')[0]);
}

process.exit(0);
