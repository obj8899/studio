
'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentProfile, useTeams, useSentJoinRequests, Team } from '@/lib/data';
import { Search, ThumbsUp, Hourglass, Check, Users, Clock, ArrowUpRight, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { RequestToJoinDialog } from '@/components/request-join-dialog';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function FindTeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, isLoading: isUserLoading } = useCurrentProfile();
  const { teams, isLoading: areTeamsLoading } = useTeams();
  const { requests: userJoinRequests, isLoading: areRequestsLoading } = useSentJoinRequests();

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    if (!searchQuery) return teams;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    
    return teams.filter(team => 
      team.name.toLowerCase().includes(lowercasedQuery) ||
      team.projectDescription.toLowerCase().includes(lowercasedQuery) ||
      team.requiredSkills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
    );
  }, [teams, searchQuery]);

  const isLoading = isUserLoading || areTeamsLoading || areRequestsLoading;

  if (isLoading) {
    return <FindTeamsSkeleton />;
  }

  const TeamCard = ({ team }: { team: Team }) => {
    const teamImage = PlaceHolderImages.find(p => p.id === team.logo);
    const teamAge = team.createdAt ? formatDistanceToNow(new Date(team.createdAt.seconds * 1000), { addSuffix: true }) : 'N/A';
    const isCreator = team.creatorId === currentUser?.id;
    const isMember = team.teamMemberIds.includes(currentUser?.id || '');
    const hasPendingRequest = userJoinRequests.some(req => req.teamId === team.id && req.status === 'pending');

    const JoinButton = () => {
        if(isMember) {
            return (
                <Button asChild size="sm" variant="secondary" disabled>
                    <div className='flex items-center gap-1'><Check className='h-4 w-4' /> Member</div>
                </Button>
            );
        }
        if (hasPendingRequest) {
            return (
                <Button asChild size="sm" variant="secondary" disabled>
                    <div className='flex items-center gap-1'><Hourglass className='h-4 w-4' /> Pending</div>
                </Button>
            );
        }
        if (!currentUser) return null;
        return (
           <RequestToJoinDialog team={team} user={currentUser}>
              <Button size="sm">
                Request to Join
              </Button>
            </RequestToJoinDialog>
        );
    }


    return (
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start gap-4">
          {teamImage && <Image src={teamImage.imageUrl} alt={team.name} width={56} height={56} className="rounded-lg" data-ai-hint={teamImage.imageHint} />}
          <div className="flex-1">
            <div className="flex items-center gap-2">
                <CardTitle>{team.name}</CardTitle>
                {isCreator && <Badge variant="secondary" className="whitespace-nowrap"><Star className="h-3 w-3 mr-1"/>Creator</Badge>}
            </div>
            <CardDescription className="line-clamp-2 mt-1">{team.projectDescription}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Open Roles</h4>
            <div className="flex flex-wrap gap-2">
              {team.openRoles.slice(0,3).map((role) => (
                <Badge key={role} variant="secondary">{role}</Badge>
              ))}
              {team.openRoles.length === 0 && <p className="text-sm text-muted-foreground">No open roles</p>}
              {team.openRoles.length > 3 && <Badge variant="outline">+{team.openRoles.length - 3} more</Badge>}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {team.requiredSkills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
               {team.requiredSkills.length > 4 && <Badge variant="outline">+{team.requiredSkills.length - 4} more</Badge>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'><Users className='h-4 w-4' /> {team.teamMemberIds.length}</div>
            <div className='flex items-center gap-1'><Clock className='h-4 w-4' /> {teamAge}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
                <Link href={`/teams/${team.id}`}>
                View <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
            </Button>
            <JoinButton />
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Team</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Browse all teams, search by skill, and find the perfect project to join.
        </p>
      </div>

        <div className="relative mb-8 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team name, project, or skill..."
            className="pl-10"
            />
        </div>

      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-muted-foreground">
          <h3 className="text-lg font-semibold">No Teams Found</h3>
          <p>Try adjusting your search query or check back later.</p>
        </div>
      )}
    </div>
  );
}

function FindTeamsSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>
       <div className="relative mb-8 max-w-lg mx-auto">
         <Skeleton className="h-12 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex-row items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
