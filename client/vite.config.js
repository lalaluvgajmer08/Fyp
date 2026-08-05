import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The backend port lives in server/.env. Hardcoding it here means the two
 * drift apart the moment someone changes it, and every request 500s through
 * the proxy — so read it from the same source of truth instead.
 */
function serverPort() {
  try {
    const env = readFileSync(resolve(here, '../server/.env'), 'utf8');
    const match = env.match(/^\s*PORT\s*=\s*(\d+)/m);
    if (match) return Number(match[1]);
  } catch {
    // server/.env not present (fresh clone, CI) — fall through to the default
  }
  return 5000;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_PROXY || `http://localhost:${serverPort()}`;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // Keeps frontend requests same-origin in dev
        '/api': {
          target,
          changeOrigin: true,
          // Surface a readable message instead of a bare 500 when the API is down
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error(`\n[proxy] cannot reach ${target} — is the server running?`);
              console.error(`[proxy] ${err.message}\n`);
            });
          },
        },
      },
    },
  };
});
