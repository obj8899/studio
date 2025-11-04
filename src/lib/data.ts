
'use client';

import { useMemo } from 'react';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, where, query } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  skills: string[];
  passion: string;
  availability: string;
  languages: string[];
  hackathonInterests: string[];
  socialLinks: string[];
  pulseIndex: number;
  avatar: string;
};


export type User = UserProfile;

export type Team = {
  id: string;
  name: string;
  logo: string;
  projectDescription: string;
  openRoles: string[];
  requiredSkills: string[];
  members: User[];
  creatorId: string;
  teamMemberIds: string[];
  createdAt: { seconds: number, nanoseconds: number };
};

export type JoinRequest = {
    id: string;
    teamId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    userEmail: string;
    role: string;
    skillsSummary: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: { seconds: number, nanoseconds: number };
}

export function useCurrentProfile() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userProfileRef);

  const currentUser = useMemo(() => {
    if (!userProfile || !user) return null;
    return {
      ...userProfile,
      name: userProfile.name || `${user.displayName}`,
    };
  }, [userProfile, user]);
  
  const isLoading = isAuthLoading || (!!user && isProfileLoading);

  return { currentUser, isLoading, error };
}

export function useTeams() {
    const firestore = useFirestore();
    const { user } = useUser();
    const teamsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'teams') : null, [firestore, user]);
    const { data: teamsData, isLoading: areTeamsLoading, error } = useCollection<Omit<Team, 'members'>>(teamsRef);

    const teams = useMemo(() => {
        if (!teamsData) return [];
        return teamsData.map((team) => {
            return {
                ...team,
                members: [], // Members will be fetched on demand on the team page
            };
        });
    }, [teamsData]);

    return { teams, isLoading: areTeamsLoading, error };
}

export function useUserTeams() {
    const { currentUser } = useCurrentProfile();
    const { teams, isLoading: areTeamsLoading, error } = useTeams();

    const createdTeams = useMemo(() => {
        if (!currentUser || !teams) return [];
        return teams.filter(team => team.creatorId === currentUser.id);
    }, [currentUser, teams]);

    const memberTeams = useMemo(() => {
        if (!currentUser || !teams) return [];
        return teams.filter(team => team.teamMemberIds.includes(currentUser.id));
    }, [currentUser, teams]);
    
    return { createdTeams, memberTeams, isLoading: areTeamsLoading, error };
}


export function useJoinRequests(teamId: string | null) {
    const firestore = useFirestore();

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore || !teamId) return null;
        return query(
            collection(firestore, 'joinRequests'),
            where('teamId', '==', teamId)
        );
    }, [firestore, teamId]);

    const { data: requests, isLoading, error } = useCollection<JoinRequest>(requestsQuery);

    return { requests: requests || [], isLoading, error };
}

export function useJoinRequestsForOwner(teamIds: string[]) {
    const firestore = useFirestore();

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore || teamIds.length === 0) return null;
        return query(
            collection(firestore, 'joinRequests'),
            where('teamId', 'in', teamIds)
        );
    }, [firestore, teamIds]);

    const { data: requests, isLoading, error } = useCollection<JoinRequest>(requestsQuery);

    return { requests: requests || [], isLoading, error };
}


export function useHackathons() {
    const firestore = useFirestore();
    const { user } = useUser();
    const hackathonsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'hackathons') : null, [firestore, user]);
    const { data: hackathonsData, isLoading, error } = useCollection<Omit<Hackathon, 'live'>>(hackathonsRef);

    const hackathons = useMemo(() => {
        return hackathonsData?.map((h) => ({
            ...h,
            live: new Date(h.startDate) <= new Date() && new Date(h.endDate) >= new Date(),
        })) || [];
    }, [hackathonsData]);

    return { hackathons, isLoading, error };
}
