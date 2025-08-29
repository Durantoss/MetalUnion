import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vinyl-splashpage.html'));
});
app.get('/home', (_req, res) => {
  res.send('<h1>Main App Loaded</h1>');
});
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'vinyl-splashpage.html'));
});
app.get('/home', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html')); // or your main app entry file
});

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
