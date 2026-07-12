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

      server.middlewares.use('/api/push-public-key', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'method not allowed' }))
          return
        }
        const { getVapidPublicKey } = await import('./src/server/push.ts')
        res.setHeader('Content-Type', 'application/json')
        try {
          res.end(JSON.stringify({ publicKey: getVapidPublicKey() }))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'unexpected error' }))
        }
      })

      server.middlewares.use(
        '/api/push-subscribe',
        jsonPostRoute(async (body) => {
          const { saveSubscription } = await import('./src/server/push.ts')
          const { deviceId, subscription } = (body ?? {}) as { deviceId?: string; subscription?: unknown }
          if (!deviceId || !subscription) return { status: 400, body: { error: 'invalid request' } }
          await saveSubscription(deviceId, subscription as never)
          return { status: 200, body: { ok: true } }
        }),
      )

      server.middlewares.use(
        '/api/push-unsubscribe',
        jsonPostRoute(async (body) => {
          const { removeSubscription } = await import('./src/server/push.ts')
          const { deviceId } = (body ?? {}) as { deviceId?: string }
          if (!deviceId) return { status: 400, body: { error: 'missing deviceId' } }
          await removeSubscription(deviceId)
          return { status: 200, body: { ok: true } }
        }),
      )

      server.middlewares.use(
        '/api/push-sync',
        jsonPostRoute(async (body) => {
          const { syncReminders } = await import('./src/server/push.ts')
          const { deviceId, events, offsets, lang } = (body ?? {}) as {
            deviceId?: string
            events?: never[]
            offsets?: number[]
            lang?: 'ar' | 'de'
          }
          if (!deviceId || !events || !offsets) return { status: 400, body: { error: 'invalid request' } }
          await syncReminders(deviceId, events, offsets, lang === 'de' ? 'de' : 'ar')
          return { status: 200, body: { ok: true } }
        }),
      )

      server.middlewares.use('/api/cron/send-reminders', async (_req, res) => {
        const { runDueReminders } = await import('./src/server/push.ts')
        res.setHeader('Content-Type', 'application/json')
        try {
          const result = await runDueReminders(20)
          res.end(JSON.stringify({ ok: true, ...result }))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'unexpected error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const passthroughEnvVars = [
    'ANTHROPIC_API_KEY',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'VAPID_SUBJECT',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'CRON_SECRET',
  ]
  for (const key of passthroughEnvVars) {
    // Assigning `undefined` to process.env[key] would coerce it to the
    // string "undefined" (Node's env store is string-only) — worse than
    // just leaving the key unset.
    const value = process.env[key] || env[key]
    if (value) process.env[key] = value
  }

  return {
    plugins: [
      react(),
      apiDevMiddleware(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
        // Lets `npm run dev` register a real service worker too, so push
        // notifications (which need one) are testable without a full build.
        devOptions: {
          enabled: true,
          type: 'module',
        },
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
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
  }
})
