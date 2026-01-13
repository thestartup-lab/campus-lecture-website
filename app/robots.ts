import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://campus-lecture-website.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/login/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
