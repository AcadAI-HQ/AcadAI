import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ResourceProgressBarProps {
  completed: number;
  total: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResourceProgressBar({
  completed,
  total,
  showPercentage = true,
  size = 'md',
  className,
}: ResourceProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">
          {completed} of {total} resources
        </span>
        {showPercentage && (
          <span className="text-xs font-medium text-[#29ABE2]">
            {percentage}%
          </span>
        )}
      </div>
      <Progress
        value={percentage}
        className={cn('bg-gray-700', sizeClasses[size])}
      />
    </div>
  );
}
