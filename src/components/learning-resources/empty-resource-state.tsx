import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyResourceStateProps {
  domain?: string;
  nextWeekDate?: string;
}

export function EmptyResourceState({
  domain,
  nextWeekDate,
}: EmptyResourceStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="rounded-full bg-gray-800 p-6 mb-6">
        <BookOpen className="h-12 w-12 text-gray-400" />
      </div>

      <h3 className="text-2xl font-semibold text-white mb-2">
        No Resources Available Yet
      </h3>

      <p className="text-gray-400 mb-6 max-w-md">
        {domain
          ? `We haven't published any learning resources for ${domain} yet.`
          : 'No learning resources are available at the moment.'}
        {nextWeekDate && (
          <span className="block mt-2">
            Check back on <span className="text-[#29ABE2]">{nextWeekDate}</span>{' '}
            for new content!
          </span>
        )}
      </p>

      <div className="flex gap-4">
        <Link href="/dashboard/learning-resources">
          <Button variant="outline" className="border-gray-700">
            Explore Other Domains
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="bg-[#29ABE2] hover:bg-[#2194c5] text-white">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
