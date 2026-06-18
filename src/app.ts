import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import jobRoutes from './modules/jobs/jobs.routes';
import reporterRoutes from './modules/reporters/reporters.routes';
import editorRoutes from './modules/editors/editors.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/jobs', jobRoutes);
app.use('/api/reporters', reporterRoutes);
app.use('/api/editors', editorRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export { app };
