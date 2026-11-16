import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const distDir = path.join(__dirname, 'dist');

app.use(express.static(distDir, { extensions: ['html'] }));

app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    res.status(404).end();
    return;
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dolce Sky Menu running at http://0.0.0.0:${PORT}`);
});
