import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="text-8xl">🗺️</div>
        <div>
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl text-muted-foreground mt-2">Page not found</h2>
        </div>
        <p className="text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/volunteer">Browse Opportunities</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
