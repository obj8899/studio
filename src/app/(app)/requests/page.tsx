
'use client';

import { useMemo } from 'react';
import { useUserTeams, useIncomingJoinRequests, useSentJoinRequests, type JoinRequest, type Team } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useUser } from "@/firebase";
import { doc, arrayUnion, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useTeams } from '@/lib/data';

const RequestCard = ({ 
  request, 
  type,
  onApprove,
  onDecline
}: { 
  request: JoinRequest, 
  type: 'incoming' | 'sent',
  onApprove?: (requestId: string, teamId: string, userId: string) => void,
  onDecline?: (requestId: string, teamId: string, userId: string) => void,
}) => {
    const { teams, isLoading: teamsLoading } = useTeams();
    const team = teams.find(t => t.id === request.teamId);
    const requestAge = formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true });

    if (teamsLoading) {
        return <RequestsSkeleton />
    }

    const statusBadge = {
        pending: <Badge variant="secondary"><X className="h-4 w-4 mr-1"/>Pending</Badge>,
        approved: <Badge variant="default" className="bg-green-600"><Check className="h-4 w-4 mr-1"/>Approved</Badge>,
        rejected: <Badge variant="destructive"><X className="h-4 w-4 mr-1"/>Rejected</Badge>
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="h-12 w-12">
                    {request.userAvatar && <AvatarImage src={request.userAvatar} alt={request.userName} />}
                    <AvatarFallback>{request.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                    <CardTitle className="text-lg">
                        {type === 'incoming' ? request.userName : team?.name}
                    </CardTitle>
                    <CardDescription>
                        {type === 'incoming' 
                            ? <>Wants to join <span className="font-semibold text-primary">{team?.name}</span> as a <span className="font-semibold text-primary">{request.role}</span></>
                            : <>You applied to join as a <span className="font-semibold text-primary">{request.role}</span></>
                        }
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">{requestAge}</p>
                </div>
                 {type === 'incoming' && request.status === 'pending' && onApprove && onDecline &&(
                    <div className="flex gap-2">
                         <Button size="sm" variant="outline" onClick={() => onDecline(request.id, request.teamId, request.userId)}><X className="h-4 w-4 mr-1"/>Decline</Button>
                         <Button size="sm" onClick={() => onApprove(request.id, request.teamId, request.userId)}><Check className="h-4 w-4 mr-1"/>Approve</Button>
                    </div>
                )}
                {type === 'sent' && (
                    <div className="flex items-center gap-2">
                        {statusBadge[request.status]}
                        <Button asChild size="sm" variant="ghost">
                            <Link href={`/teams/${request.teamId}`}>View Team</Link>
                        </Button>
                    </div>
                )}
                 {type === 'incoming' && request.status !== 'pending' && statusBadge[request.status]}
            </CardHeader>
            <CardContent>
                <h4 className="text-sm font-medium mb-2">Skills Summary / Message</h4>
                <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">{request.skillsSummary}</p>
            </CardContent>
        </Card>
    )
}

const RequestList = ({ requests, type, ...props }: { requests: JoinRequest[], type: 'incoming' | 'sent', onApprove?: any, onDecline?: any, isLoading: boolean }) => {
    if (props.isLoading) return <RequestsSkeleton />;
    if (requests.length === 0) {
        return <p className="text-center text-muted-foreground py-10">No {type} requests.</p>;
    }
    return (
        <div className="space-y-4">
            {requests.map(req => <RequestCard key={req.id} request={req} type={type} {...props}/>)}
        </div>
    );
};

export default function RequestsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    
    const { requests: incomingRequests, isLoading: incomingLoading } = useIncomingJoinRequests();
    const { requests: sentRequests, isLoading: sentLoading } = useSentJoinRequests();

    const handleRequest = (requestId: string, teamId: string, userId: string, approved: boolean) => {
        if (!firestore) return;

        const requestRef = doc(firestore, 'joinRequests', requestId);
        updateDocumentNonBlocking(requestRef, { status: approved ? 'approved' : 'rejected' });

        if (approved) {
            const teamRef = doc(firestore, 'teams', teamId);
            updateDocumentNonBlocking(teamRef, { teamMemberIds: arrayUnion(userId) });
            const userProfileRef = doc(firestore, 'users', userId);
            updateDocumentNonBlocking(userProfileRef, { pulseIndex: increment(13) });
            toast({ title: "Member Approved", description: "The user has been added to the team." });
        } else {
            toast({ title: "Request Rejected", description: "The join request has been rejected." });
        }
    }
    
    const sortedIncoming = useMemo(() => {
        return [...incomingRequests].sort((a,b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.createdAt.seconds - a.createdAt.seconds)
    }, [incomingRequests]);

    if (isUserLoading) {
        return <RequestsSkeleton />
    }

     if (!user) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Join Requests</h1>
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">Please log in to manage requests.</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Join Requests</h1>
            
            <Tabs defaultValue="incoming">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="incoming"><ArrowLeft className="mr-2 h-4 w-4"/>Incoming ({incomingRequests.length})</TabsTrigger>
                    <TabsTrigger value="sent"><ArrowRight className="mr-2 h-4 w-4" />Sent ({sentRequests.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="incoming" className="mt-6">
                    <RequestList 
                        requests={sortedIncoming} 
                        type="incoming" 
                        onApprove={(reqId, teamId, userId) => handleRequest(reqId, teamId, userId, true)}
                        onDecline={(reqId, teamId, userId) => handleRequest(reqId, teamId, userId, false)}
                        isLoading={incomingLoading}
                    />
                </TabsContent>
                 <TabsContent value="sent" className="mt-6">
                    <RequestList 
                        requests={sentRequests}
                        type="sent" 
                        isLoading={sentLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}


function RequestsSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-1/3 mb-8" />
            <Skeleton className="h-12 w-full mb-6" />
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
