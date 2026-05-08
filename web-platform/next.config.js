const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/wiki/stories', destination: '/stories', permanent: true },
      { source: '/wiki/timeline', destination: '/wiki/history', permanent: true },
      { source: '/wiki/categories', destination: '/wiki', permanent: true },
      { source: '/wiki/places', destination: '/wiki', permanent: true },
      { source: '/wiki/topics', destination: '/wiki', permanent: true },
      { source: '/wiki/achievements', destination: '/wiki', permanent: true },
      { source: '/wiki/culture', destination: '/wiki', permanent: true },
      { source: '/wiki/services', destination: '/wiki', permanent: true },

      // ── Curation 2026-05-08 — keep only the killer surfaces.
      // Files stay in the worktree for now; routes redirect to canonical.
      // Remove any of these to bring the page back, or git rm the folder
      // when ready for a real cleanup.
      { source: '/road-to-20-years',         destination: '/20-years',       permanent: true },
      { source: '/timeline',                 destination: '/20-years',       permanent: true },
      { source: '/history',                  destination: '/20-years',       permanent: true },
      { source: '/community',                destination: '/voices',         permanent: true },
      { source: '/storytellers',             destination: '/voices/who',     permanent: true },
      { source: '/voices/notes',             destination: '/share-note',     permanent: true },
      { source: '/voices/questions',         destination: '/voices/themes',  permanent: true },
      { source: '/voices/ask',               destination: '/share-note',     permanent: true },
      { source: '/voices/pulse',             destination: '/voices',         permanent: true },
      { source: '/voices/this-month',        destination: '/voices',         permanent: true },
      { source: '/share-art',                destination: '/share-note',     permanent: true },
      { source: '/share-story',              destination: '/share-note',     permanent: true },
      { source: '/share-voice',              destination: '/share-note',     permanent: true },
      { source: '/empathy-ledger',           destination: '/voices/network', permanent: true },
      { source: '/calendar',                 destination: '/',               permanent: true },
      { source: '/about',                    destination: '/',               permanent: true },
      { source: '/explore',                  destination: '/voices',         permanent: true },
      { source: '/publications',             destination: '/voices',         permanent: true },
      // /stories index reinstated — surfaces the 74 public stories
      // (flood/challenge, service success, community, elder wisdom)
      // that were previously locked behind /stories/[id] direct links.
      { source: '/thematic-reports',         destination: '/voices/themes',  permanent: true },
      { source: '/elders/voices-on-country', destination: '/elders',         permanent: true },
      { source: '/20-years/dashboard',       destination: '/20-years',       permanent: true },
      { source: '/20-years/strategy',        destination: '/20-years',       permanent: true },
      { source: '/annual-report/live',       destination: '/annual-reports', permanent: true },
      { source: '/annual-report/print',      destination: '/annual-reports', permanent: true },
    ]
  },
  outputFileTracingExcludes: {
    '/*': [
      '**/public/documents/**',
      '**/public/hero-assets/**',
      '**/public/video/**',
      '**/public/annual-report-photos/**',
      '**/public/archive-photos/**',
      '**/public/report-assets/**',
      '**/public/service-icons/**',
      '**/public/icons/**',
      '**/public/cyclone-kirrily-temp/**',
    ],
  },
  // PDF font files are loaded at runtime via path.join — Next.js can't trace
  // these dynamic imports, so include them explicitly for every PDF route.
  outputFileTracingIncludes: {
    '/api/pdf/**': ['lib/pdf/fonts/**/*.ttf'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'uaxhjzqrdotoahjnxmbj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

module.exports = withSentryConfig(nextConfig, {
  // Suppress source map upload warnings when SENTRY_AUTH_TOKEN is not set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps for better stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
})
