import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for local session/plans/debt if requested
const plans = [];
const debtAssessments = [];
const debtActions = [];

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/me', (req, res) => {
  res.json({ user: null });
});

app.post('/api/auth/request-link', (req, res) => {
  res.json({ success: true, message: 'Magic link sent (mock)' });
});

app.post('/api/auth/verify', (req, res) => {
  res.json({ success: true, user: { id: 'mock-user', email: 'user@example.com' } });
});

app.get('/api/plans', (req, res) => {
  res.json(plans);
});

app.post('/api/plans', (req, res) => {
  const plan = { id: String(Date.now()), ...req.body, created_at: new Date().toISOString() };
  plans.push(plan);
  res.json(plan);
});

app.get('/api/debt-navigator/assessments', (req, res) => {
  res.json(debtAssessments);
});

app.post('/api/debt-navigator/assessments', (req, res) => {
  const assessment = { id: String(Date.now()), ...req.body, created_at: new Date().toISOString() };
  debtAssessments.push(assessment);
  res.json(assessment);
});

app.delete('/api/debt-navigator/assessments/:id', (req, res) => {
  const idx = debtAssessments.findIndex(a => a.id === req.params.id);
  if (idx !== -1) debtAssessments.splice(idx, 1);
  res.status(204).send();
});

app.get('/api/debt-navigator/actions', (req, res) => {
  const { assessment_id } = req.query;
  if (assessment_id) {
    return res.json(debtActions.filter(a => a.assessment_id === assessment_id));
  }
  res.json(debtActions);
});

app.post('/api/debt-navigator/actions', (req, res) => {
  const action = { id: String(Date.now()), ...req.body, created_at: new Date().toISOString() };
  debtActions.push(action);
  res.json(action);
});

app.patch('/api/debt-navigator/actions/:id', (req, res) => {
  const action = debtActions.find(a => a.id === req.params.id);
  if (action) {
    Object.assign(action, req.body);
    return res.json(action);
  }
  res.status(404).json({ error: 'Action not found' });
});

// Serve static files from root
app.use(express.static(__dirname));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
