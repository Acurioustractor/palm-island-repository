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

module.exports = nextConfig
