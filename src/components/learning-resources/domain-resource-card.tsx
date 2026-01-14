import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResourceProgressBar } from './resource-progress-bar';

interface DomainResourceCardProps {
  domain: {
    id: string;
    name: string;
    icon: LucideIcon;
  };
  availableWeeks: number;
  completionPercentage?: number;
  onSelect: () => void;
}

export function DomainResourceCard({
  domain,
  availableWeeks,
  completionPercentage = 0,
  onSelect,
}: DomainResourceCardProps) {
  const Icon = domain.icon;
  const hasResources = availableWeeks > 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        onClick={hasResources ? onSelect : undefined}
        className={`h-full flex flex-col justify-between transition-all duration-300 ${
          hasResources
            ? 'cursor-pointer hover:border-primary hover:shadow-lg'
            : 'cursor-not-allowed bg-card/50 text-muted-foreground'
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <Icon
              className={`h-10 w-10 mb-4 ${hasResources ? 'text-primary' : ''}`}
            />
            {!hasResources ? (
              <Badge variant="secondary">Coming Soon</Badge>
            ) : (
              <Badge variant="outline" className="border-[#29ABE2] text-[#29ABE2]">
                {availableWeeks} {availableWeeks === 1 ? 'Week' : 'Weeks'}
              </Badge>
            )}
          </div>
          <CardTitle className="font-headline">{domain.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            {hasResources
              ? `Explore ${availableWeeks} week${availableWeeks !== 1 ? 's' : ''} of curated learning resources for ${domain.name}.`
              : `Learning resources for ${domain.name} will be available soon.`}
          </CardDescription>

          {hasResources && completionPercentage > 0 && (
            <ResourceProgressBar
              completed={completionPercentage}
              total={100}
              showPercentage={true}
              size="sm"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
