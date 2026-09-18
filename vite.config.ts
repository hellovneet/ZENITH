import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, rootDir, '');
  const supabaseUrl =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    fileEnv.SUPABASE_URL ??
    fileEnv.VITE_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    fileEnv.SUPABASE_PUBLISHABLE_KEY ??
    fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

  return {
    root: rootDir,
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/health' && req.method === 'GET') {
              try {
                const { GET } = await import('./api/health.ts');
                const response = await GET();
                const data = await response.json();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              } catch (err) {
                console.error('API /api/health error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: String(err) }));
                return;
              }
            }

            if (req.url === '/api/chat') {
              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.end();
                return;
              }
              if (req.method === 'POST') {
                try {
                  const chunks: Uint8Array[] = [];
                  for await (const chunk of req) {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                  }
                  const rawBody = Buffer.concat(chunks).toString('utf-8');
                  const { POST } = await import('./api/chat.ts');
                  const syntheticRequest = new Request('http://localhost:3000/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: rawBody,
                  });
                  const response = await POST(syntheticRequest);
                  res.statusCode = response.status;
                  response.headers.forEach((value, key) => res.setHeader(key, value));
                  const resText = await response.text();
                  res.end(resText);
                  return;
                } catch (err) {
                  console.error('API /api/chat error:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Failed to process chat request' }));
                  return;
                }
              }
            }

            next();
          });
        },
      },
    ],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabasePublishableKey),
    },
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
