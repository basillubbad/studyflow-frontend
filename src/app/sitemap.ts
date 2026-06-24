import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://studyflow-frontend-roan.vercel.app'
  
  // Base routes to be indexed
  const routes = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/faq',
    '/pricing',
    '/privacy',
    '/terms',
    '/cookie-policy'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
