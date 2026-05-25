import Link from 'next/link';
import { Star, GraduationCap, Globe } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from './verified-badge';
import { getInitials } from '@/lib/utils';
import type { MentorProfile, User } from '@/types';

interface MentorCardProps {
  mentor: User & { mentor_profiles: MentorProfile };
}

export function MentorCard({ mentor }: MentorCardProps) {
  const profile = mentor.mentor_profiles;

  return (
    <Card className="card-hover flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={mentor.avatar_url ?? ''} alt={mentor.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(mentor.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold truncate">{mentor.full_name}</h3>
              {profile.verified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{profile.university}</span>
            </div>
            {profile.country && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>{profile.country}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {mentor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
        )}

        {profile.expertise_areas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.expertise_areas.slice(0, 3).map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
            {profile.expertise_areas.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.expertise_areas.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{profile.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({profile.total_sessions} sessions)
            </span>
          </div>
          <div>
            {profile.session_type === 'free' ? (
              <Badge variant="success" className="text-xs">Free</Badge>
            ) : (
              <span className="font-semibold text-sm">
                ${profile.price_per_session}/hr
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button asChild className="w-full" size="sm">
          <Link href={`/mentors/${mentor.id}`}>Book Session</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
