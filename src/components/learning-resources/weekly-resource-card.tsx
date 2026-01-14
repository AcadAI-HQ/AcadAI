import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResourceProgressBar } from './resource-progress-bar';
import { formatDistance } from 'date-fns';

interface WeeklyResourceCardProps {
  weekNumber: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  publishedDate: string;
  completedResources?: number;
  totalResources: number;
  isCompleted?: boolean;
  onClick: () => void;
}

export function WeeklyResourceCard({
  weekNumber,
  title,
  difficulty,
  estimatedTime,
  publishedDate,
  completedResources = 0,
  totalResources,
  isCompleted = false,
  onClick,
}: WeeklyResourceCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const publishedAgo = formatDistance(new Date(publishedDate), new Date(), {
    addSuffix: true,
  });

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        onClick={onClick}
        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300"
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#29ABE2]">
                Week {weekNumber}
              </span>
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <Badge
              variant="outline"
              className={difficultyColors[difficulty]}
            >
              {difficulty}
            </Badge>
          </div>

          <CardTitle className="font-headline text-lg line-clamp-2">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{publishedAgo}</span>
            </div>
          </div>

          {completedResources > 0 && (
            <ResourceProgressBar
              completed={completedResources}
              total={totalResources}
              showPercentage={true}
              size="sm"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
