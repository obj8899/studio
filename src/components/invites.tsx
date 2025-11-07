
'use client';
import { useIncomingJoinRequests } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useFirestore } from "@/firebase";
import { doc, arrayUnion, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Link from "next/link";
import { useUserTeams } from "@/lib/data";

export function Invites() {
    const { createdTeams, isLoading: teamsLoading } = useUserTeams();
    const { requests: incomingRequests, isLoading: requestsLoading } = useIncomingJoinRequests();

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
            
            const userProfileRef = doc(firestore, 'users', userId);
            updateDocumentNonBlocking(userProfileRef, {
                pulseIndex: increment(13) // +5 for approved, +8 for joining
            });
            
            toast({ title: "Member Approved", description: "The user has been added to the team." });
        } else {
            toast({ title: "Request Rejected", description: "The join request has been rejected." });
        }
    }

    if(isLoading) {
        return <Skeleton className="h-24 w-full" />
    }

    const pendingRequests = incomingRequests.filter(r => r.status === 'pending');

    if (createdTeams.length === 0 || pendingRequests.length === 0) {
        return <p className="text-sm text-muted-foreground text-center">No pending join requests.</p>
    }

    return (
        <div className="space-y-4">
            {pendingRequests.slice(0, 2).map(req => {
                const team = createdTeams.find(t => t.id === req.teamId);
                
                return (
                    <div key={req.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            {req.userAvatar && <AvatarImage src={req.userAvatar} alt={req.userName} />}
                            <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                <span className="font-semibold">{req.userName}</span> wants to join <span className="font-semibold">{team?.name}</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <Button size="sm" variant="outline" onClick={() => handleRequest(req.id, req.teamId, req.userId, false)}>Decline</Button>
                             <Button size="sm" onClick={() => handleRequest(req.id, req.teamId, req.userId, true)}>Approve</Button>
                        </div>
                    </div>
                )
            })}
             {pendingRequests.length > 2 && (
              <Button variant="link" asChild className="w-full">
                <Link href="/requests">View all requests</Link>
              </Button>
            )}
        </div>
    )
}
