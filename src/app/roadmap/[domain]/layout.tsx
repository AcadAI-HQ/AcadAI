import { Metadata } from 'next';

type Props = {
  params: Promise<{ domain: string }>;
  children: React.ReactNode;
};

// Domain metadata configuration
const domainMetadata: Record<string, { title: string; description: string; keywords: string[] }> = {
  frontend: {
    title: 'Frontend Development Roadmap - Personalized Learning Path',
    description: 'Hyper-personalized frontend development roadmap tailored to your skills and pace. Master React, Vue, modern JavaScript, responsive design, and web performance with AI-driven customization.',
    keywords: ['frontend development', 'personalized roadmap', 'react roadmap', 'vue.js', 'javascript', 'web development', 'responsive design', 'CSS', 'HTML5', 'custom learning path'],
  },
  backend: {
    title: 'Backend Development Roadmap - Customized Learning',
    description: 'Personalized backend development roadmap adapted to your proficiency level. Master APIs, databases, system architecture, Node.js, Python, and scalable design at your own pace.',
    keywords: ['backend development', 'personalized learning', 'API design', 'database', 'nodejs', 'python', 'REST API', 'GraphQL', 'microservices', 'custom roadmap'],
  },
  fullstack: {
    title: 'Fullstack Development Roadmap - Adaptive Learning Path',
    description: 'AI-powered fullstack roadmap customized to your skills. Complete path from frontend to backend, databases, deployment, and architecture tailored to your learning speed.',
    keywords: ['fullstack development', 'personalized learning', 'full stack', 'MERN stack', 'web development', 'javascript', 'react', 'nodejs', 'adaptive learning'],
  },
  'machine-learning': {
    title: 'Machine Learning Roadmap - Skill-Based Customization',
    description: 'Personalized ML roadmap from foundations to MLOps. Master Python, TensorFlow, PyTorch, neural networks, and production ML systems at your proficiency level.',
    keywords: ['machine learning', 'personalized ML', 'AI', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'data science', 'custom learning'],
  },
  devops: {
    title: 'DevOps Engineering Roadmap - Tailored Learning',
    description: 'Customized DevOps roadmap for your skill level. Master CI/CD, Docker, Kubernetes, cloud platforms (AWS, Azure, GCP), and automation at your own pace.',
    keywords: ['devops', 'personalized learning', 'CI/CD', 'docker', 'kubernetes', 'AWS', 'cloud computing', 'infrastructure', 'automation', 'custom roadmap'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const metadata = domainMetadata[domain] || domainMetadata.frontend;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
      url: `/roadmap/${domain}`,
      images: [
        {
          url: `/og-${domain}.png`,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [`/og-${domain}.png`],
    },
  };
}

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
