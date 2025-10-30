
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useHackathons } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getTimeRemaining = (endtime: string) => {
  const total = Date.parse(endtime) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
};

const CountdownTimer = ({ date }: { date: string }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(date));
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  if (timeRemaining.total <= 0) {
    const isPast = new Date(date) < new Date();
    if(isPast) {
        return <span className="font-semibold text-destructive">Ended</span>;
    }
  }
  
  const isRegistration = new Date(date) > new Date();

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="font-mono">
        {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}
        {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
      </span>
    </div>
  );
};


export default function HackathonsPage() {
  const { hackathons, isLoading } = useHackathons();

  if(isLoading) {
    return <HackathonsSkeleton />
  }

  const liveHackathons = hackathons.filter((h) => h.live);
  const upcomingHackathons = hackathons.filter((h) => !h.live);

  const getHackathonImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return img || PlaceHolderImages[7]; // default hackathon image
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Hackathons</h1>
      
      <section>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-primary">Live Events</h2>
        {liveHackathons.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveHackathons.map((hackathon) => (
                <Card key={hackathon.id} className="flex flex-col">
                <CardHeader>
                    <div className="relative h-40 w-full">
                        <Image 
                            src={getHackathonImage(hackathon.logo).imageUrl}
                            alt={hackathon.name}
                            fill
                            className="rounded-t-lg object-cover"
                            data-ai-hint={getHackathonImage(hackathon.logo).imageHint}
                        />
                    </div>
                    <CardTitle className="pt-4">{hackathon.name}</CardTitle>
                    <CardDescription>{hackathon.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex items-center justify-between">
                    <Badge>Live</Badge>
                    <CountdownTimer date={hackathon.endDate} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                    <Link href={hackathon.registrationLink}>Join Now</Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No live hackathons right now. Check back soon!</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Upcoming</h2>
        {upcomingHackathons.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingHackathons.map((hackathon) => (
                <Card key={hackathon.id} className="flex flex-col">
                <CardHeader>
                    <div className="relative h-40 w-full">
                        <Image 
                            src={getHackathonImage(hackathon.logo).imageUrl}
                            alt={hackathon.name}
                            fill
                            className="rounded-t-lg object-cover"
                            data-ai-hint={getHackathonImage(hackathon.logo).imageHint}
                        />
                    </div>
                    <CardTitle className="pt-4">{hackathon.name}</CardTitle>
                    <CardDescription>{hackathon.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex items-center justify-between">
                    <Badge variant="secondary">Upcoming</Badge>
                    <CountdownTimer date={hackathon.startDate} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant="secondary">
                    <Link href={hackathon.registrationLink}>Register</Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No upcoming hackathons scheduled.</p>
        )}
      </section>
    </div>
  );
}

function HackathonsSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-1/3 mb-8" />
            
            <section>
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1,2].map(i => (
                        <Card key={i}><CardHeader><Skeleton className="h-40 w-full" /><Skeleton className="h-6 w-3/4 mt-4" /><Skeleton className="h-4 w-full mt-2" /></CardHeader><CardContent><Skeleton className="h-8 w-full"/></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                    ))}
                </div>
            </section>

            <section className="mt-12">
                <Skeleton className="h-8 w-1/4 mb-4" />
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1,2,3].map(i => (
                        <Card key={i}><CardHeader><Skeleton className="h-40 w-full" /><Skeleton className="h-6 w-3/4 mt-4" /><Skeleton className="h-4 w-full mt-2" /></CardHeader><CardContent><Skeleton className="h-8 w-full"/></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
