import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from './verified-badge';
import { DeadlineCountdown } from './deadline-countdown';
import type { VolunteerListing, InternshipListing } from '@/types';

interface VolunteerCardProps {
  listing: VolunteerListing;
  type: 'volunteer';
}

interface InternshipCardProps {
  listing: InternshipListing;
  type: 'internship';
}

type OpportunityCardProps = VolunteerCardProps | InternshipCardProps;

export function OpportunityCard({ listing, type }: OpportunityCardProps) {
  const href = `/${type === 'volunteer' ? 'volunteer' : 'internships'}/${listing.id}`;

  return (
    <Card className="card-hover flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge variant={type === 'volunteer' ? 'secondary' : 'default'} className="text-xs">
                {type === 'volunteer' ? '🤝 Volunteer' : '💼 Internship'}
              </Badge>
              {listing.is_verified && <VerifiedBadge size="sm" />}
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              <Link href={href} className="hover:text-primary transition-colors">
                {listing.title}
              </Link>
            </h3>
          </div>
        </div>

        {type === 'volunteer' && (listing as VolunteerListing).category && (
          <Badge variant="outline" className="w-fit text-xs">
            {(listing as VolunteerListing).category}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {listing.description}
        </p>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {listing.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
          )}

          {type === 'volunteer' && (listing as VolunteerListing).spots_available !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{(listing as VolunteerListing).spots_available} spots available</span>
            </div>
          )}

          {listing.deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <DeadlineCountdown deadline={listing.deadline} />
            </div>
          )}
        </div>

        {type === 'internship' && (listing as InternshipListing).min_gpa && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Min GPA:</span>
            <span className="font-medium">{(listing as InternshipListing).min_gpa}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <Button asChild className="w-full" size="sm">
          <Link href={href}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
