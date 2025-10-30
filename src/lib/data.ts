
'use client';

import { useMemo } from 'react';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';

export type User = {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  passion: string;
  availability: string;
  interests: string[];
  pulseIndex: number;
  email: string;
  firstName: string;
  lastName: string;
  experience?: string;
  languages?: string[];
  hackathonInterests?: string[];
  socialLinks?: string[];
};

export type Team = {
  id: string;
  name: string;
  logo: string;
  projectDescription: string;
  openRoles: string[];
  requiredSkills: string[];
  members: User[];
  teamMemberIds: string[];
  age: string;
};

export type Hackathon = {
  id: string;
  name:string;
  logo: string;
  startDate: string;
  endDate: string;
  description: string;
  registrationLink: string;
  live: boolean;
};

export function useCurrentProfile() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading, error } = useDoc<User>(userProfileRef);

    const currentUser = useMemo(() => {
        if (!userProfile) return null;
        return {
            ...userProfile,
            id: userProfile.id,
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            passion: 'Building scalable AI applications',
            availability: '15-20 hours/week',
            interests: userProfile.hackathonInterests || ['AI', 'Web Dev', 'Mobile'],
            pulseIndex: 88,
            avatar: '1',
        };
    }, [userProfile]);

    return { currentUser, isLoading, error };
}

export function useUsers() {
    const firestore = useFirestore();
    const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: usersData, isLoading, error } = useCollection<User>(usersRef);

    const users = useMemo(() => {
        return usersData?.map(u => ({
            ...u,
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            passion: 'User passion placeholder',
            availability: 'User availability placeholder',
            interests: u.hackathonInterests || [],
            pulseIndex: Math.floor(Math.random() * 20) + 80, // placeholder
            avatar: String(Math.floor(Math.random() * 4) + 1), // placeholder
        })) || [];
    }, [usersData]);

    return { users, isLoading, error };
}

export function useTeams() {
    const firestore = useFirestore();
    const { users } = useUsers();
    const teamsRef = useMemoFirebase(() => firestore ? collection(firestore, 'teams') : null, [firestore]);
    const { data: teamsData, isLoading, error } = useCollection<Omit<Team, 'members'>>(teamsRef);

    const teams = useMemo(() => {
        if (!teamsData || users.length === 0) return [];
        return teamsData.map(team => {
            const members = team.teamMemberIds
                ? team.teamMemberIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[]
                : [];
            return {
                ...team,
                members,
                logo: String(Math.floor(Math.random() * 3) + 5), // placeholder
                age: "A few days ago" // placeholder
            };
        });
    }, [teamsData, users]);

    return { teams, isLoading, error };
}

export function useHackathons() {
    const firestore = useFirestore();
    const hackathonsRef = useMemoFirebase(() => firestore ? collection(firestore, 'hackathons') : null, [firestore]);
    const { data: hackathonsData, isLoading, error } = useCollection<Omit<Hackathon, 'live' | 'logo' | 'name' | 'description'>>(hackathonsRef);

    const hackathons = useMemo(() => {
        return hackathonsData?.map(h => ({
            ...h,
            id: h.id,
            name: h.eventName,
            description: h.eventDetails,
            live: new Date(h.startDate) <= new Date() && new Date(h.endDate) >= new Date(),
            logo: String(Math.floor(Math.random() * 3) + 8), // placeholder
        })) || [];
    }, [hackathonsData]);

    return { hackathons, isLoading, error };
}
