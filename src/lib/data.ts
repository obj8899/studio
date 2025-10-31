'use client';

import { useMemo } from 'react';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
  teamMemberIds: string[];
  createdAt: { seconds: number, nanoseconds: number };
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
      name: userProfile.name || `${user.displayName}`,
    };
  }, [userProfile, user]);
  
  const isLoading = isAuthLoading || (!!user && isProfileLoading);

  return { currentUser, isLoading, error };
}

export function useUsers(userIds: string[] | null | undefined) {
    const firestore = useFirestore();
    const { user } = useUser();

    const userDocs = useMemo(() => {
        if (!firestore || !user || !userIds) return [];
        return userIds.map(id => {
            const ref = doc(firestore, 'users', id);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { data, isLoading, error } = useDoc<UserProfile>(useMemoFirebase(() => ref, [ref]));
            return { data, isLoading, error };
        });
    }, [firestore, user, userIds]);

    const users = useMemo(() => {
        return userDocs.map(ud => ud.data).filter(Boolean) as UserProfile[];
    }, [userDocs]);

    const isLoading = useMemo(() => {
        return userDocs.some(ud => ud.isLoading);
    }, [userDocs]);
    
    const error = useMemo(() => {
        return userDocs.find(ud => ud.error)?.error || null;
    }, [userDocs]);

    return { users, isLoading, error };
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
                members: [], // Members will be fetched on demand
            };
        });
    }, [teamsData]);

    return { teams, isLoading: areTeamsLoading, error };
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
