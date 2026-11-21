import { fileURLToPath, URL } from 'node:url'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// O Service Worker precisa mudar em cada deploy para que o navegador
// identifique a nova versão, mesmo quando sw.js não foi editado no Git.
function versionedServiceWorker() {
  return {
    name: 'recados-versioned-service-worker',
    apply: 'build',
    async writeBundle(options) {
      const swPath = resolve(options.dir || 'dist', 'sw.js')
      const swSource = await readFile(swPath, 'utf8')
      const buildId = process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.GITHUB_SHA ||
        String(Date.now())

      if (!swSource.includes('__REC_BUILD_ID__')) {
        throw new Error('Marcador de versão do Service Worker não encontrado.')
      }

      await writeFile(
        swPath,
        swSource.replaceAll('__REC_BUILD_ID__', buildId),
        'utf8',
      )
    },
  }
}

export default defineConfig({
  plugins: [vue(), versionedServiceWorker()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/jwt-decode')) return 'jwt'
        },
      },
    },
  },
})
