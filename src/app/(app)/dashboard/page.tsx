
'use client';
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentProfile, useHackathons, useTeams } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { currentUser, isLoading: isUserLoading } = useCurrentProfile();
  const { teams, isLoading: areTeamsLoading } = useTeams();
  const { hackathons, isLoading: areHackathonsLoading } = useHackathons();

  if (isUserLoading || areTeamsLoading || areHackathonsLoading) {
    return <DashboardSkeleton />;
  }

  if (!currentUser) {
      return <div className="text-center py-10">Please log in to see your dashboard.</div>
  }

  const userTeams = teams.filter(team => team.members.some(member => member.id === currentUser.id));
  const liveHackathons = hackathons.filter(h => h.live);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-8">
      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pulse Index
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.pulseIndex}</div>
              <p className="text-xs text-muted-foreground">
                +2.1 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userTeams.length}</div>
              <p className="text-xs text-muted-foreground">
                Actively collaborating
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Hackathons</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveHackathons.length}</div>
              <p className="text-xs text-muted-foreground">
                Happening now on campus
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Invites
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Teams want you to join them
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>
                  Recent activity from your teams.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/teams">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Project
                    </TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                 {userTeams.map(team => (
                    <TableRow key={team.id}>
                        <TableCell>
                        <div className="font-medium">{team.name}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                           {team.members.length} members
                        </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-column">
                            {team.projectDescription.substring(0,50)}...
                        </TableCell>
                        <TableCell className="text-right">
                           <Button asChild variant="outline" size="sm">
                                <Link href={`/teams/${team.id}`}>View</Link>
                           </Button>
                        </TableCell>
                    </TableRow>
                 ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Hackathons</CardTitle>
              <CardDescription>
                Don't miss the next big event.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {hackathons.filter(h => !h.live).slice(0, 3).map(hackathon => (
                <div key={hackathon.id} className="flex items-center gap-4">
                    <Trophy className="h-6 w-6 text-muted-foreground" />
                    <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                        {hackathon.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Starts in {Math.round((new Date(hackathon.startDate).getTime() - Date.now()) / (1000*60*60*24))} days
                    </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="ml-auto">
                        <Link href="/hackathons">
                            Details
                        </Link>
                    </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle><CardDescription><Skeleton className="h-4 w-2/4" /></CardDescription></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
          </Card>
          <Card>
             <CardHeader><CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle><CardDescription><Skeleton className="h-4 w-2/4" /></CardDescription></CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="grid gap-1 flex-1"><Skeleton className="h-4 w-2/4" /><Skeleton className="h-3 w-1/4" /></div></div>
              <div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="grid gap-1 flex-1"><Skeleton className="h-4 w-2/4" /><Skeleton className="h-3 w-1/4" /></div></div>
              <div className="flex items-center gap-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="grid gap-1 flex-1"><Skeleton className="h-4 w-2/4" /><Skeleton className="h-3 w-1/4" /></div></div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
