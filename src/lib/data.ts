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
  experience: string;
  languages: string[];
  hackathonInterests: string[];
  socialLinks: string[];
};


export type User = UserProfile & {
  name: string;
  avatar: string;
  passion: string;
  availability: string;
  interests: string[];
  pulseIndex: number;
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
  name: string;
  logo: string;
  startDate: string;
  endDate: string;
  description: string;
  registrationLink: string;
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
      // TODO: These are placeholders, they should be moved to the UserProfile entity
      passion: 'Building scalable AI applications',
      availability: '15-20 hours/week',
      interests: userProfile.hackathonInterests || ['AI', 'Web Dev', 'Mobile'],
      pulseIndex: 88,
      avatar: '1',
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
        return usersData?.map((u, index) => ({
            ...u,
            name: `${u.firstName} ${u.lastName}`,
            // TODO: These are placeholders, they should be moved to the UserProfile entity
            passion: 'User passion placeholder',
            availability: 'User availability placeholder',
            interests: u.hackathonInterests || [],
            pulseIndex: Math.floor(Math.random() * 20) + 80,
            avatar: String((index % 4) + 1),
        })) || [];
    }, [usersData]);

    return { users, isLoading, error };
}

export function useTeams() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { users } = useUsers();
    const teamsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'teams') : null, [firestore, user]);
    const { data: teamsData, isLoading, error } = useCollection<Omit<Team, 'members' | 'logo' | 'age'>>(teamsRef);

    const teams = useMemo(() => {
        if (!teamsData || users.length === 0) return [];
        return teamsData.map((team, index) => {
            const members = team.teamMemberIds
                ? team.teamMemberIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[]
                : [];
            return {
                ...team,
                members,
                // TODO: These are placeholders
                logo: String((index % 3) + 5),
                age: "A few days ago" 
            };
        });
    }, [teamsData, users]);

    return { teams, isLoading, error };
}

export function useHackathons() {
    const firestore = useFirestore();
    const { user } = useUser();
    const hackathonsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'hackathons') : null, [firestore, user]);
    const { data: hackathonsData, isLoading, error } = useCollection<Omit<Hackathon, 'live' | 'logo' | 'name' | 'description'>>(hackathonsRef);

    const hackathons = useMemo(() => {
        return hackathonsData?.map((h, index) => ({
            ...h,
            // @ts-ignore
            name: h.eventName,
            // @ts-ignore
            description: h.eventDetails,
            live: new Date(h.startDate) <= new Date() && new Date(h.endDate) >= new Date(),
            logo: String((index % 3) + 8), 
        })) || [];
    }, [hackathonsData]);

    return { hackathons, isLoading, error };
}
