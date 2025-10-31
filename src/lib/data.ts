'use client';

import { useMemo } from 'react';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  skills: string[];
  passion: string;
  availability: string;
  languages: string[];
  hackathonInterests: string[];
  socialLinks: string[];
  pulseIndex: number;
  avatar: string;
};


export type User = UserProfile & {
  name: string;
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
  createdAt: { seconds: number, nanoseconds: number };
};

export type Hackathon = {
  id:string;
  eventName: string;
  eventDetails: string;
  registrationLink: string;
  startDate: string;
  endDate: string;
  logo: string;
  live: boolean;
};

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
      name: `${userProfile.firstName} ${userProfile.lastName}`,
    };
  }, [userProfile, user]);
  
  const isLoading = isAuthLoading || (!!user && isProfileLoading);

  return { currentUser, isLoading, error };
}

export function useUsers() {
    const firestore = useFirestore();
    const { user } = useUser();
    const usersRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users') : null, [firestore, user]);
    const { data: usersData, isLoading, error } = useCollection<UserProfile>(usersRef);

    const users = useMemo(() => {
        return usersData?.map((u) => ({
            ...u,
            name: `${u.firstName} ${u.lastName}`,
        })) || [];
    }, [usersData]);

    return { users, isLoading, error };
}

export function useTeams() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { users, isLoading: areUsersLoading } = useUsers();
    const teamsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'teams') : null, [firestore, user]);
    const { data: teamsData, isLoading: areTeamsLoading, error } = useCollection<Omit<Team, 'members'>>(teamsRef);

    const teams = useMemo(() => {
        if (!teamsData || users.length === 0) return [];
        return teamsData.map((team) => {
            const members = team.teamMemberIds
                ? team.teamMemberIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[]
                : [];
            return {
                ...team,
                members,
            };
        });
    }, [teamsData, users]);

    const isLoading = areTeamsLoading || areUsersLoading;

    return { teams, isLoading, error };
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
