import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acadai.org';

  // All 14 available roadmap domains
  const roadmapDomains = [
    'frontend',
    'backend',
    'fullstack',
    'ml',
    'devops',
    'data-science',
    'cybersecurity',
    'ui-ux',
    'product-engineering',
    'game-dev-indie',
    'game-dev-aaa',
    'android',
    'iOS',
    'blockchain',
  ];

  // Main pages
  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  // Roadmap pages
  const roadmapPages = roadmapDomains.map((domain) => ({
    url: `${baseUrl}/roadmap/${domain}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...mainPages, ...roadmapPages];
}
