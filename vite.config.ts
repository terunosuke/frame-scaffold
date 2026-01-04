import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// .env ファイルを読み込んで process.env に設定
dotenv.config();

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      {
        name: 'api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/gemini' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const handler = await import('./api/gemini.ts');
                  const mockReq = { method: 'POST', body: JSON.parse(body) };
                  const mockRes = {
                    status: (code: number) => ({
                      json: (data: any) => {
                        res.statusCode = code;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                      }
                    }),
                    setHeader: (name: string, value: string) => {
                      res.setHeader(name, value);
                    }
                  };
                  await handler.default(mockReq, mockRes);
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ message: 'Internal server error' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        // external: ['xlsx', 'file-saver'] ←これ削除！
      }
    },
    optimizeDeps: {
      include: ['file-saver'],  // ←xlsxは入れない
      exclude: ['xlsx']
    }
  };
});
