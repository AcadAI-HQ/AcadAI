import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorResourceStateProps {
  errorType: 'not-found' | 'load-error' | 'invalid-week';
  domain?: string;
  weekNumber?: number;
  onRetry?: () => void;
}

export function ErrorResourceState({
  errorType,
  domain,
  weekNumber,
  onRetry,
}: ErrorResourceStateProps) {
  const getErrorContent = () => {
    switch (errorType) {
      case 'not-found':
        return {
          title: 'Resource Not Found',
          message: `Week ${weekNumber} for ${domain} doesn't exist or hasn't been published yet.`,
        };
      case 'invalid-week':
        return {
          title: 'Invalid Week Number',
          message: 'This week number is not valid. Please check the URL and try again.',
        };
      case 'load-error':
      default:
        return {
          title: 'Failed to Load Resource',
          message: 'We encountered an error while loading this resource. Please try again.',
        };
    }
  };

  const { title, message } = getErrorContent();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="rounded-full bg-red-900/20 p-6 mb-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>

      <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>

      <p className="text-gray-400 mb-6 max-w-md">{message}</p>

      <div className="flex gap-4">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}

        {domain && (
          <Link href={`/dashboard/learning-resources/${domain}`}>
            <Button variant="outline" className="border-gray-700">
              View All Weeks
            </Button>
          </Link>
        )}

        <Link href="/dashboard/learning-resources">
          <Button className="bg-[#29ABE2] hover:bg-[#2194c5] text-white">
            Browse Resources
          </Button>
        </Link>
      </div>
    </div>
  );
}
