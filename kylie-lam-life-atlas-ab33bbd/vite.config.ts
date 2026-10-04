import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { handleAiHttp } from './server/openai.mjs'

/** POST /api/ai on the dev server, same route the built site serves. */
function aiApi(): Plugin {
  return {
    name: 'sidequest-ai-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.url ?? '').split('?')[0] !== '/api/ai') {
          next()
          return
        }
        void handleAiHttp(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [aiApi(), react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 4179,
    strictPort: true,
  },
})
