import express from 'express';
import apiRouter from '../server/api.js';

const app = express();
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[Vercel API] ${req.method} ${req.url}`);
  next();
});

app.use('/api', apiRouter);

// Global error handler so it returns JSON instead of crashing Vercel lambda
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Express Error:", err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
