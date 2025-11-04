
'use client';

import { useMemo } from 'react';
import { useUserTeams, useJoinRequestsForOwner, JoinRequest } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase";
import { doc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RequestsPage() {
    const { createdTeams, isLoading: teamsLoading } = useUserTeams();
    const teamIds = useMemo(() => createdTeams.map(t => t.id), [createdTeams]);
    const { requests, isLoading: requestsLoading } = useJoinRequestsForOwner(teamIds);
    const firestore = useFirestore();
    const { toast } = useToast();

    const isLoading = teamsLoading || requestsLoading;

    const handleRequest = (requestId: string, teamId: string, userId: string, approved: boolean) => {
        if (!firestore) return;

        const requestRef = doc(firestore, 'joinRequests', requestId);
        updateDocumentNonBlocking(requestRef, { status: approved ? 'approved' : 'rejected' });

        if (approved) {
            const teamRef = doc(firestore, 'teams', teamId);
            updateDocumentNonBlocking(teamRef, {
                teamMemberIds: arrayUnion(userId)
            });
            toast({ title: "Member Approved", description: "The user has been added to the team." });
        } else {
            toast({ title: "Request Rejected", description: "The join request has been rejected." });
        }
    }

    const sortedRequests = useMemo(() => {
        const pending = requests.filter(r => r.status === 'pending');
        const approved = requests.filter(r => r.status === 'approved');
        const rejected = requests.filter(r => r.status === 'rejected');
        return { pending, approved, rejected };
    }, [requests]);

    if (isLoading) {
        return <RequestsSkeleton />
    }
    
    if (createdTeams.length === 0) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Join Requests</h1>
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">You haven't created any teams yet.</h2>
                    <p className="text-muted-foreground mt-2">Only creators can see join requests.</p>
                </div>
            </div>
        )
    }

    const RequestCard = ({ request }: { request: JoinRequest }) => {
        const team = createdTeams.find(t => t.id === request.teamId);
        const requestAge = formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true });

        return (
            <Card>
                <CardHeader className="flex flex-row items-start gap-4">
                    <Avatar className="h-12 w-12">
                        {request.userAvatar && <AvatarImage src={request.userAvatar} alt={request.userName} />}
                        <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                        <CardTitle>{request.userName}</CardTitle>
                        <CardDescription>
                            Wants to join <span className="font-semibold text-primary">{team?.name}</span> as a <span className="font-semibold text-primary">{request.role}</span>
                        </CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">{requestAge}</p>
                    </div>
                     {request.status === 'pending' && (
                        <div className="flex gap-2">
                             <Button size="sm" variant="outline" onClick={() => handleRequest(request.id, request.teamId, request.userId, false)}><X className="h-4 w-4 mr-1"/>Decline</Button>
                             <Button size="sm" onClick={() => handleRequest(request.id, request.teamId, request.userId, true)}><Check className="h-4 w-4 mr-1"/>Approve</Button>
                        </div>
                    )}
                    {request.status === 'approved' && <Badge variant="default" className="bg-green-600"><Check className="h-4 w-4 mr-1"/>Approved</Badge>}
                    {request.status === 'rejected' && <Badge variant="destructive"><X className="h-4 w-4 mr-1"/>Rejected</Badge>}
                </CardHeader>
                <CardContent>
                    <h4 className="text-sm font-medium mb-2">Skills Summary</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">{request.skillsSummary}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Join Requests</h1>
            
            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({sortedRequests.pending.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({sortedRequests.approved.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({sortedRequests.rejected.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    <div className="space-y-4">
                        {sortedRequests.pending.length > 0 ? (
                            sortedRequests.pending.map(req => <RequestCard key={req.id} request={req} />)
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No pending requests.</p>
                        )}
                    </div>
                </TabsContent>
                 <TabsContent value="approved" className="mt-6">
                    <div className="space-y-4">
                        {sortedRequests.approved.length > 0 ? (
                            sortedRequests.approved.map(req => <RequestCard key={req.id} request={req} />)
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No approved requests yet.</p>
                        )}
                    </div>
                </TabsContent>
                 <TabsContent value="rejected" className="mt-6">
                    <div className="space-y-4">
                        {sortedRequests.rejected.length > 0 ? (
                            sortedRequests.rejected.map(req => <RequestCard key={req.id} request={req} />)
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No rejected requests.</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}


function RequestsSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-1/3 mb-8" />
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-start gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className='flex-1 space-y-2'>
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-4 w-1/5 mb-2" />
                             <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
