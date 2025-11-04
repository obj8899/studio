
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { type Team, type UserProfile as User, useJoinRequests, useCurrentProfile } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chat } from "@/components/chat";
import { Clock, Code, Target, Users as UsersIcon, UserPlus, Check, Hourglass } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { RequestToJoinDialog } from '@/components/request-join-dialog';

const useTeamMembers = (teamData: Omit<Team, 'members'> | null) => {
    const firestore = useFirestore();
    const [members, setMembers] = React.useState<User[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!teamData || !teamData.teamMemberIds || !firestore) {
            setIsLoading(false);
            return;
        }

        const fetchMembers = async () => {
            setIsLoading(true);
            const memberPromises = teamData.teamMemberIds.map(id => getDoc(doc(firestore, 'users', id)));
            const memberDocs = await Promise.all(memberPromises);
            const memberProfiles = memberDocs
                .filter(doc => doc.exists())
                .map(doc => ({ ...doc.data(), id: doc.id } as User));
            setMembers(memberProfiles);
            setIsLoading(false);
        };

        fetchMembers();
    }, [teamData, firestore]);

    return { members, isLoading };
};

export default function TeamProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();
  const { currentUser } = useCurrentProfile();

  const teamRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'teams', id);
  }, [firestore, id]);

  const { data: teamData, isLoading: isTeamLoading } = useDoc<Omit<Team, 'members'>>(teamRef);
  
  const { members: memberProfiles, isLoading: areUsersLoading } = useTeamMembers(teamData);

  const { requests, isLoading: areRequestsLoading } = useJoinRequests(id);

  const team = useMemo(() => {
    if (!teamData) return null;
    return {
      ...teamData,
      members: memberProfiles || [],
    };
  }, [teamData, memberProfiles]);

  const isMember = useMemo(() => {
    if (!currentUser || !team) return false;
    return team.teamMemberIds.includes(currentUser.id);
  }, [currentUser, team]);

  const hasPendingRequest = useMemo(() => {
     if (areRequestsLoading || !requests || !currentUser) return false;
     return requests.some(r => r.userId === currentUser.id && r.status === 'pending');
  }, [requests, areRequestsLoading, currentUser])

  if (isTeamLoading || areUsersLoading) {
    return <TeamProfileSkeleton />;
  }

  if (!team) {
    return notFound();
  }

  const teamImage = PlaceHolderImages.find(p => p.id === team.logo);
  const getUserImage = (id: string) => PlaceHolderImages.find(p => p.id === id);
  const teamAge = team.createdAt ? formatDistanceToNow(new Date(team.createdAt.seconds * 1000)) : 'N/A';
  
  const JoinButton = () => {
    if (isMember) {
        return <Button size="lg" disabled><Check className="mr-2 h-5 w-5"/>Already a Member</Button>
    }
    if(hasPendingRequest) {
        return <Button size="lg" disabled><Hourglass className="mr-2 h-5 w-5"/>Request Pending</Button>
    }
    if (areRequestsLoading || !currentUser || !team) {
        return <Button size="lg" disabled>Loading...</Button>
    }
    return <RequestToJoinDialog team={team} user={currentUser}><Button size="lg"><UserPlus className="mr-2 h-5 w-5"/>Request to Join</Button></RequestToJoinDialog>
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {teamImage && <Image src={teamImage.imageUrl} alt={team.name} width={128} height={128} className="rounded-lg border-2 border-primary" data-ai-hint={teamImage.imageHint} />}
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight">{team.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{team.projectDescription}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className='flex items-center gap-1.5'><UsersIcon className='h-4 w-4' /> {team.members.length} members</div>
                <div className='flex items-center gap-1.5'><Clock className='h-4 w-4' /> Created {teamAge} ago</div>
            </div>
          </div>
          <JoinButton />
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/>Project Goal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{team.projectDescription}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5 text-primary"/>Tech Stack & Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                            {team.requiredSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Open Roles</CardTitle>
                        <CardDescription>We're looking for passionate individuals to join us.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        {team.openRoles.map(role => (
                            <div key={role} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                                <span className="font-medium">{role}</span>
                                 {currentUser && <RequestToJoinDialog team={team} user={currentUser} defaultRole={role}><Button size="sm">Apply</Button></RequestToJoinDialog>}
                            </div>
                        ))}
                        {team.openRoles.length === 0 && <p className="text-sm text-center text-muted-foreground">No open roles currently.</p>}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>The amazing people building {team.name}.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.members.map(member => {
                const memberImage = getUserImage(member.avatar);
                return (
                    <Card key={member.id}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                {memberImage && <AvatarImage src={memberImage.imageUrl} alt={member.name} data-ai-hint="person portrait"/>}
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.skills.slice(0,2).join(', ')}</p>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                    <Link href={`/profile/${member.id}`}>View Profile</Link>
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chat" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Team Chat</CardTitle>
                    <CardDescription>Real-time collaboration with your team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Chat team={team} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}

function TeamProfileSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <Skeleton className="h-32 w-32 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                    <Skeleton className="h-12 w-36" />
                </div>
            </header>

             <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                     <div className="grid md:grid-cols-3 gap-6">
                         <div className="md:col-span-2 space-y-6">
                            <Card><CardHeader><Skeleton className="h-6 w-1/3 mb-2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                            <Card><CardHeader><Skeleton className="h-6 w-1/3 mb-2" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
                         </div>
                         <div className="space-y-6">
                            <Card><CardHeader><Skeleton className="h-6 w-1/2 mb-2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                         </div>
                     </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
