// This is a simplified version of server/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import { setupVite, serveStatic, log } from './vite';

const app: Express = express();
const port = process.env.PORT || 5000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup static file serving for uploaded files
app.use('/activity-cards', express.static(path.join(process.cwd(), 'client/public/activity-cards')));

async function startServer() {
  // Register API routes (simplified for schedule app)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    log(`Error: ${err.message}`);
    res.status(500).json({ status: 'error', message: err.message });
  });

  // If development, setup Vite dev server
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app);
  } else {
    // If production, serve static files
    serveStatic(app);
  }

  // Start the server
  const server = app.listen(port, () => {
    log(`serving on port ${port}`);
  });

  return server;
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});