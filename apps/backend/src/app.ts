import express from 'express';
import cors from 'cors';
import devicesRouter from './routes/devices';
import alertsRouter from './routes/alerts';
import powerRouter from './routes/power';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/devices', devicesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/power', powerRouter);

export { app };
