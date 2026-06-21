import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrate';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '3000', 10);

export { app };

async function bootstrap() {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Champs HR API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Only call bootstrap when this file is run directly, not when imported by tests
if (require.main === module) {
  bootstrap();
}
