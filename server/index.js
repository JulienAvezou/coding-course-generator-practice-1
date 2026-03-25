import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

import { createStarterSummary } from '../src/library.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(express.static(publicDir));

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    message: createStarterSummary()
  });
});

app.listen(port, () => {
  console.log(`Library Tracker starter running at http://localhost:${port}`);
});
