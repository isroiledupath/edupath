import Link from 'next/link';
import Image from 'next/image';
import { Play, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatViews } from '@/lib/utils';
import type { VideoLesson, VideoCategory } from '@/types';

interface VideoCardProps {
  video: VideoLesson;
}

const categoryLabels: Record<VideoCategory, string> = {
  academics: '📚 Academics',
  leadership: '🏆 Leadership',
  skills: '⚡ Skills',
  university_guide: '🎓 University Guide',
  visa: '✈️ Visa',
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="card-hover overflow-hidden group">
      <Link href={`/resources/videos/${video.id}`}>
        <div className="relative aspect-video bg-muted overflow-hidden">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-accent/20">
              <Play className="h-12 w-12 text-primary/50" />
            </div>
          )}
          {video.duration_seconds > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration_seconds)}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
        </div>
      </Link>

      <CardContent className="p-3 space-y-1.5">
        <Badge variant="secondary" className="text-xs">
          {categoryLabels[video.category]}
        </Badge>

        <Link href={`/resources/videos/${video.id}`}>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
            {video.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(video.views)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
