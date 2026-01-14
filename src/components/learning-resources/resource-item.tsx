import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Video,
  Code,
  Trophy,
  Clock,
  ExternalLink,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { ResourceItem as ResourceItemType } from '@/types/weekly-resources';
import { useState } from 'react';
import { ArticleViewer } from './article-viewer';

interface ResourceItemProps {
  resource: ResourceItemType;
  isCompleted: boolean;
  onToggleCompletion: (resourceId: string, completed: boolean) => Promise<void>;
}

export function ResourceItem({
  resource,
  isCompleted,
  onToggleCompletion,
}: ResourceItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showArticle, setShowArticle] = useState(false);

  const typeIcons = {
    article: FileText,
    video: Video,
    tutorial: Code,
    project: Trophy,
    course: GraduationCap,
  };

  const typeColors = {
    article: 'text-blue-400',
    video: 'text-red-400',
    tutorial: 'text-green-400',
    project: 'text-purple-400',
    course: 'text-orange-400',
  };

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const Icon = typeIcons[resource.type as keyof typeof typeIcons] || FileText;

  const handleCheckboxChange = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onToggleCompletion(resource.id, checked);
    } catch (error) {
      console.error('Failed to update completion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    // If has inline content, open article viewer
    if (resource.content) {
      setShowArticle(true);
    } else if (resource.url) {
      // Otherwise open external URL
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Card
        className={`group hover:border-primary transition-all duration-300 ${
          isCompleted ? 'bg-green-500/5 border-green-500/20' : ''
        }`}
      >
        <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            disabled={isUpdating}
            className="mt-1"
          />

          {/* Icon */}
          <div
            className={`rounded-full bg-gray-800 p-2 ${typeColors[resource.type as keyof typeof typeColors] || 'text-gray-400'}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4
                className={`font-semibold text-white group-hover:text-[#29ABE2] transition-colors cursor-pointer ${
                  isCompleted ? 'line-through opacity-70' : ''
                }`}
                onClick={handleCardClick}
              >
                {resource.title}
              </h4>
              <ExternalLink
                className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                onClick={handleCardClick}
              />
            </div>

            <p className="text-sm text-gray-400 mb-3">{resource.description}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={difficultyColors[resource.difficulty]}
              >
                {resource.difficulty}
              </Badge>

              <Badge variant="outline" className="border-gray-700 capitalize">
                {resource.type}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{resource.estimatedTime} min</span>
              </div>

              {resource.content && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto border-[#29ABE2] text-[#29ABE2] hover:bg-[#29ABE2] hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowArticle(true);
                  }}
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Read Article
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Article Viewer Modal */}
    {resource.content && (
      <ArticleViewer
        resource={resource}
        isOpen={showArticle}
        onClose={() => setShowArticle(false)}
      />
    )}
    </>
  );
}
