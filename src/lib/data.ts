
'use client';

import { useMemo } from 'react';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, where, query } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { HACKATHON_CATEGORIES } from './hackathon-categories';

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

export type Hackathon = {
    id: string;
    eventName: string;
    eventDetails: string;
    registrationLink: string;
    startDate: string;
    endDate: string;
    logo: string;
    live: boolean;
    category: string;
}

export type Team = {
  id: string;
  logo: string;
  name: string;
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
    const { currentUser, isLoading: isUserLoading } = useCurrentProfile();
    const { teams, isLoading: areTeamsLoading, error } = useTeams();

    const createdTeams = useMemo(() => {
        if (!currentUser || !teams) return [];
        return teams.filter(team => team.creatorId === currentUser.id);
    }, [currentUser, teams]);

    const memberTeams = useMemo(() => {
        if (!currentUser || !teams) return [];
        return teams.filter(team => team.teamMemberIds.includes(currentUser.id));
    }, [currentUser, teams]);
    
    return { createdTeams, memberTeams, isLoading: areTeamsLoading || isUserLoading, error };
}


export function useJoinRequests(teamId: string | null) {
    const firestore = useFirestore();
    const canQuery = typeof teamId === 'string' && teamId.length > 0;

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore || !canQuery) return null;
        return query(collection(firestore, 'joinRequests'), where('teamId', '==', teamId));
    }, [firestore, canQuery, teamId]);

    const { data, isLoading, error } = useCollection<JoinRequest>(requestsQuery);
    
    if (!canQuery) {
        return { requests: [], isLoading: false, error: null };
    }
    
    return { requests: data || [], isLoading, error };
}


export function useIncomingJoinRequests() {
    const firestore = useFirestore();
    const { createdTeams, isLoading: areTeamsLoading } = useUserTeams();
    const teamIds = useMemo(() => createdTeams.map(t => t.id), [createdTeams]);

    // This is the key fix. We ensure that we don't query if team loading is still in progress OR if the user has no teams.
    const canQuery = !areTeamsLoading && teamIds.length > 0;

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore || !canQuery) return null;
        return query(collection(firestore, 'joinRequests'), where('teamId', 'in', teamIds));
    }, [firestore, canQuery, teamIds]);

    const { data, isLoading: areRequestsLoading, error } = useCollection<JoinRequest>(requestsQuery);
    
    if (!canQuery) {
        return { requests: [], isLoading: areTeamsLoading, error: null };
    }
    
    return { requests: data || [], isLoading: areRequestsLoading, error };
}


export function useSentJoinRequests() {
    const firestore = useFirestore();
    const { currentUser, isLoading: isUserLoading } = useCurrentProfile();
    
    const canQuery = !isUserLoading && !!currentUser?.id;

    const requestsQuery = useMemoFirebase(() => {
        if (!firestore || !canQuery) return null;
        return query(collection(firestore, 'joinRequests'), where('userId', '==', currentUser.id));
    }, [firestore, canQuery, currentUser?.id]);

    const { data, isLoading: areRequestsLoading, error } = useCollection<JoinRequest>(requestsQuery);

    if (!canQuery) {
        return { requests: [], isLoading: isUserLoading, error: null };
    }

    return { requests: data || [], isLoading: areRequestsLoading, error };
}



const getDummyHackathons = () => {
    const now = new Date();
    const liveStartDate = new Date(now);
    liveStartDate.setDate(now.getDate() - 2);
    const liveEndDate = new Date(now);
    liveEndDate.setDate(now.getDate() + 5);

    const upcomingStartDate = new Date(now);
    upcomingStartDate.setDate(now.getDate() + 7);
    const upcomingEndDate = new Date(now);
    upcomingEndDate.setDate(now.getDate() + 10);
    
    const upcomingStartDate2 = new Date(now);
    upcomingStartDate2.setDate(now.getDate() + 14);
    const upcomingEndDate2 = new Date(now);
    upcomingEndDate2.setDate(now.getDate() + 18);


    return [
         {
            id: '1',
            eventName: 'Smart India Hackathon',
            eventDetails: 'A nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives.',
            category: 'AI',
            startDate: liveStartDate.toISOString(),
            endDate: liveEndDate.toISOString(),
            registrationLink: 'https://www.sih.gov.in/',
            logo: '8',
         },
         {
            id: '3',
            eventName: 'GreenCode Hackathon',
            category: 'ClimateTech',
            eventDetails: 'A sustainability-focused hackathon encouraging AI and IoT projects to combat climate change.',
            registrationLink: 'https://unstop.com/greencode-hackathon',
            startDate: liveStartDate.toISOString(),
            endDate: liveEndDate.toISOString(),
            logo: '9',
         },
        {
            id: '6',
            eventName: 'Hack4Good Global 2025',
            category: 'Open Innovation',
            eventDetails: 'Empowering youth to build tech for education, inclusion, and global good.',
            registrationLink: 'https://hack4good.org',
            startDate: liveStartDate.toISOString(),
            endDate: liveEndDate.toISOString(),
            logo: '10',
        },
         {
            id: '2',
            eventName: 'Web3 Builders Summit',
            category: 'Web3',
            eventDetails: 'Build decentralized apps that redefine ownership and identity in the digital world.',
            registrationLink: 'https://hackerearth.com/web3-builders',
            startDate: upcomingStartDate.toISOString(),
            endDate: upcomingEndDate.toISOString(),
            logo: '9'
         },
        {
            id: '4',
            eventName: 'Pulse of Innovation 2025',
            category: 'Open Innovation',
            eventDetails: 'An open-theme hackathon to showcase creativity, innovation, and problem-solving in any domain.',
            registrationLink: 'https://devfolio.co/pulseofinnovation',
            startDate: upcomingStartDate.toISOString(),
            endDate: upcomingEndDate.toISOString(),
            logo: '8',
        },
         {
            id: '5',
            eventName: 'FinEdge Tech Jam',
            category: 'FinTech',
            eventDetails: 'Reimagine banking, payments, and crypto systems through data-driven innovation.',
            registrationLink: 'https://hackathon.com/finedge',
            startDate: upcomingStartDate2.toISOString(),
            endDate: upcomingEndDate2.toISOString(),
            logo: '9',
         },
    ];
}


export function useHackathons() {
    const firestore = useFirestore();
    const { user } = useUser();
    // const hackathonsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'hackathons') : null, [firestore, user]);
    // const { data: hackathonsData, isLoading, error } = useCollection<Omit<Hackathon, 'live' | 'category'>>(hackathonsRef);

    const hackathonsData = getDummyHackathons();
    const isLoading = false;
    const error = null;

    const hackathons = useMemo(() => {
        return hackathonsData?.map((h) => ({
            ...h,
            live: new Date(h.startDate) <= new Date() && new Date(h.endDate) >= new Date(),
        })) || [];
    }, [hackathonsData]);

    return { hackathons, isLoading, error };
}
