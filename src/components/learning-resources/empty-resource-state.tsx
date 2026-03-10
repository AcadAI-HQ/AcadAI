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
      <div className="rounded-full bg-muted p-6 mb-6">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
      </div>

      <h3 className="text-2xl font-semibold text-foreground mb-2">
        {domain ? `${domain} resources are coming soon.` : 'No resources published yet.'}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
        {domain
          ? `AcadAI curates fresh learning resources every Monday. Your first batch for this domain will be ready in the next weekly update.`
          : 'AcadAI researches and curates resources every Monday. Check back then — or explore one of the domains that\'s already available.'}
        {nextWeekDate && (
          <span className="block mt-2 text-sm">
            Next update: <span className="text-[#29ABE2] font-medium">{nextWeekDate}</span>
          </span>
        )}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/dashboard/learning-resources">
          <Button variant="outline">
            Explore other domains
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-muted-foreground">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
