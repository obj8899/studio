
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserTeams } from '@/lib/data';
import { ArrowUpRight, Clock, Users, Plus, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useCurrentProfile } from '@/lib/data';

export default function TeamsListPage() {
  const { memberTeams, isLoading } = useUserTeams();
  const { currentUser } = useCurrentProfile();

  if (isLoading) {
    return <TeamsListSkeleton />;
  }

  const TeamCard = ({ team }: { team: (typeof memberTeams)[0] }) => {
    const teamImage = PlaceHolderImages.find(p => p.id === team.logo);
    const teamAge = team.createdAt ? formatDistanceToNow(new Date(team.createdAt.seconds * 1000)) : 'N/A';
    const isCreator = team.creatorId === currentUser?.id;

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
        <CardFooter className="flex justify-between">
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'><Users className='h-4 w-4' /> {team.teamMemberIds.length}</div>
            <div className='flex items-center gap-1'><Clock className='h-4 w-4' /> {teamAge} ago</div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/teams/${team.id}`}>
              View <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight">My Teams</h1>
        <Button asChild>
          <Link href="/teams/create"><Plus className="mr-2 h-4 w-4"/>Create a New Team</Link>
        </Button>
      </div>

      {memberTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {memberTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">You haven't joined any teams yet.</h2>
          <p className="text-muted-foreground mt-2">Find a team to join or create your own!</p>
          <div className="flex gap-4 justify-center mt-6">
            <Button asChild>
                <Link href="/find-teams">Find Teams</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/teams/create">Create a Team</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamsListSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-36" />
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
