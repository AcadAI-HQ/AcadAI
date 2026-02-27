import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.acadai.org';

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
    'ios',
    'blockchain',
  ];

  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  const roadmapPages: MetadataRoute.Sitemap = roadmapDomains.map((domain) => ({
    url: `${baseUrl}/roadmap/${domain}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...mainPages, ...roadmapPages, ...blogPages];
}
