import { createApp } from './app.js';
import { connectToDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/filafacil';

async function start(): Promise<void> {
  await connectToDatabase(mongoUri);
  const app = createApp();

  app.listen(port, () => {
    console.log(`FilaFácil listening on http://localhost:${port}`);
  });
}

start().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
