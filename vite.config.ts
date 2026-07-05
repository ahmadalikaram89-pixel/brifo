import { defineConfig, loadEnv, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function jsonPostRoute(handler: (body: unknown) => Promise<{ status: number; body: unknown }>): Connect.SimpleHandleFunction {
  return (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'method not allowed' }))
      return
    }

    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json')
      try {
        const body = JSON.parse(raw || '{}')
        const { status, body: responseBody } = await handler(body)
        res.statusCode = status
        res.end(JSON.stringify(responseBody))
      } catch {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'invalid request body' }))
      }
    })
  }
}

function apiDevMiddleware(): Plugin {
  return {
    name: 'brifo-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(
        '/api/analyze',
        jsonPostRoute(async (body) => {
          const { image, mediaType } = (body ?? {}) as { image?: string; mediaType?: string }
          const { analyzeLetterImage, AnalyzeError } = await import('./src/server/analyze.ts')
          try {
            if (!image || !mediaType) throw new AnalyzeError('missing image or mediaType')
            const result = await analyzeLetterImage(image, mediaType)
            return { status: 200, body: result }
          } catch (err) {
            if (err instanceof AnalyzeError) return { status: 400, body: { error: err.message } }
            console.error('analyze failed', err)
            return { status: 500, body: { error: 'analysis failed' } }
          }
        }),
      )

      server.middlewares.use(
        '/api/reply',
        jsonPostRoute(async (body) => {
          const { generateReplyLetter, ReplyError } = await import('./src/server/reply.ts')
          try {
            const result = await generateReplyLetter(body)
            return { status: 200, body: result }
          } catch (err) {
            if (err instanceof ReplyError) return { status: 400, body: { error: err.message } }
            console.error('reply generation failed', err)
            return { status: 500, body: { error: 'reply generation failed' } }
          }
        }),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY

  return {
    plugins: [
      react(),
      apiDevMiddleware(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon.svg'],
        manifest: {
          name: 'Brifo — بريفو',
          short_name: 'Brifo',
          description:
            'يساعد الأهل الناطقين بالعربي في النمسا على فهم رسائل المدرسة، معرفة المواعيد، وكتابة الردود بالألماني.',
          lang: 'ar',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#f5f6fb',
          theme_color: '#f5f6fb',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
      }),
    ],
  }
})
