// This is the server/vite.ts file for the new project
import { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Server } from 'http';

export function log(message: string, source = "express") {
  console.log(`${new Date().toLocaleTimeString()} [${source}] ${message}`);
}

export async function setupVite(app: Express) {
  log("Setting up Vite dev server");
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: true,
    },
    appType: 'spa',
  });
  
  app.use(vite.middlewares);
  
  app.use('*', async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    
    try {
      // Path to the index.html file in client directory
      let indexPath = path.join(process.cwd(), 'client', 'index.html');
      if (!fs.existsSync(indexPath)) {
        indexPath = path.join(process.cwd(), 'index.html');
      }
      
      let template = fs.readFileSync(indexPath, 'utf-8');
      
      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);
      
      // Send the transformed HTML back
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  log("Setting up static file serving");
  // Serve the static files from the client/dist directory
  app.use(express.static(path.join(process.cwd(), 'client/dist')));
  
  // Serve the index.html for all non-asset/api routes for client-side routing
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
  });
}