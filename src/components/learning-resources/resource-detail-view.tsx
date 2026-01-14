import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';
import { WeeklyResource } from '@/types/weekly-resources';
import { ResourceItem } from './resource-item';
import { ResourceProgressBar } from './resource-progress-bar';
import { formatDistance } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ResourceDetailViewProps {
  resource: WeeklyResource;
  completedResources: string[];
  onToggleCompletion: (resourceId: string, completed: boolean) => Promise<void>;
  onMarkWeekComplete: () => Promise<void>;
}

export function ResourceDetailView({
  resource,
  completedResources,
  onToggleCompletion,
  onMarkWeekComplete,
}: ResourceDetailViewProps) {
  const { toast } = useToast();

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const totalResources = (resource.resources?.length || 0) + 1; // +1 for main article
  const completedCount = completedResources.length;
  const progress = Math.round((completedCount / totalResources) * 100);
  const isFullyCompleted = progress === 100;

  const publishedAgo = formatDistance(
    new Date(resource.publishedDate),
    new Date(),
    { addSuffix: true }
  );

  const handleMarkComplete = async () => {
    try {
      await onMarkWeekComplete();
      toast({
        title: 'Week completed!',
        description: 'Great job completing all resources this week.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark week as complete',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Week {resource.weekNumber}
              </h1>
              {isFullyCompleted && (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              )}
            </div>
            <h2 className="text-xl text-gray-300">{resource.title}</h2>
          </div>

          <Badge
            variant="outline"
            className={difficultyColors[resource.difficulty]}
          >
            {resource.difficulty}
          </Badge>
        </div>

        <p className="text-gray-400">{resource.description}</p>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{resource.estimatedTime} minutes total</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Published {publishedAgo}</span>
          </div>
        </div>

        {/* Topics */}
        {resource.topics && resource.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Progress */}
        <Card className="bg-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Your Progress
              </span>
              {!isFullyCompleted && (
                <Button
                  size="sm"
                  onClick={handleMarkComplete}
                  className="bg-[#29ABE2] hover:bg-[#2194c5]"
                >
                  Mark All Complete
                </Button>
              )}
            </div>
            <ResourceProgressBar
              completed={completedCount}
              total={totalResources}
              showPercentage={true}
              size="md"
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Main Article */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Main Article</h3>
        <ResourceItem
          resource={resource.mainArticle}
          isCompleted={completedResources.includes(resource.mainArticle.id)}
          onToggleCompletion={onToggleCompletion}
        />
      </div>

      <Separator />

      {/* Supplementary Resources */}
      {resource.resources && resource.resources.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Supplementary Resources ({resource.resources.length})
          </h3>
          <div className="space-y-3">
            {resource.resources.map((item) => (
              <ResourceItem
                key={item.id}
                resource={item}
                isCompleted={completedResources.includes(item.id)}
                onToggleCompletion={onToggleCompletion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {resource.keywords && resource.keywords.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
