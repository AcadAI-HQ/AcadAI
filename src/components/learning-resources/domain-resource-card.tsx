import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
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
  /** true when AI-generated weeks exist for this domain */
  hasAiContent?: boolean;
  onSelect: () => void;
}

export function DomainResourceCard({
  domain,
  availableWeeks,
  completionPercentage = 0,
  hasAiContent = false,
  onSelect,
}: DomainResourceCardProps) {
  const Icon = domain.icon;
  const hasResources = availableWeeks > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <Card
        onClick={hasResources ? onSelect : undefined}
        className={`
          h-full flex flex-col justify-between transition-all duration-200 relative overflow-hidden
          ${hasResources
            ? 'cursor-pointer hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]'
            : 'cursor-not-allowed opacity-60'}
          ${hasAiContent
            ? 'border-l-2 border-l-[#8E2DE2] hover:border-[#8E2DE2]/30'
            : 'hover:border-primary/40'}
        `}
      >
        {/* Subtle AI tint overlay — only when hasAiContent */}
        {hasAiContent && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#8E2DE2]/3 to-transparent"
            aria-hidden
          />
        )}

        <CardHeader className="relative">
          <div className="flex justify-between items-start mb-3">
            {/* Icon with optional shimmer */}
            <div className={`relative ${hasAiContent ? 'ai-icon-shimmer' : ''}`}>
              <Icon
                className={`h-9 w-9 ${
                  hasResources
                    ? hasAiContent ? 'text-[#C084FC]' : 'text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            </div>

            {/* Badge cluster */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {hasAiContent && hasResources && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-[#8E2DE2]/15 text-[#C084FC] border border-[#8E2DE2]/25"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  AI Curated
                </motion.span>
              )}
              {!hasResources ? (
                <Badge variant="secondary" className="text-[11px]">Coming Soon</Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-[#29ABE2]/40 text-[#29ABE2] text-[11px]"
                >
                  {availableWeeks} {availableWeeks === 1 ? 'Week' : 'Weeks'}
                </Badge>
              )}
            </div>
          </div>

          <CardTitle className="font-headline text-base leading-snug">
            {domain.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <CardDescription className="mb-4 text-[13px] leading-relaxed">
            {hasResources
              ? `${availableWeeks} week${availableWeeks !== 1 ? 's' : ''} of ${hasAiContent ? 'AI-curated' : 'curated'} learning resources for ${domain.name}.`
              : (
                <span>
                  Learning resources for {domain.name} are coming soon.{' '}
                  <span className="text-[#C084FC]/80">AI resources launching shortly.</span>
                </span>
              )
            }
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
