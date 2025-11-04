
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
import { HACKATHON_CATEGORIES } from '@/lib/hackathon-categories';
import { motion } from 'framer-motion';

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

const CountdownTimer = ({ date, isUpcoming }: { date: string, isUpcoming: boolean }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(date));
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  if (timeRemaining.total <= 0) {
    return <span className="font-semibold text-destructive">Ended</span>;
  }
  
  const prefix = isUpcoming ? "Starts in" : "Ends in";

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="font-mono">
        {prefix} {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}
        {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
      </span>
    </div>
  );
};


const HackathonCard = ({ hackathon }: { hackathon: ReturnType<typeof useHackathons>['hackathons'][0] }) => {
    const img = PlaceHolderImages.find(p => p.id === hackathon.logo) || PlaceHolderImages[7];
    const categoryInfo = HACKATHON_CATEGORIES[hackathon.category] || HACKATHON_CATEGORIES['Open Innovation'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
        >
        <Card className="flex flex-col h-full border-l-4" style={{ borderLeftColor: categoryInfo.color }}>
            <CardHeader>
                <div className="relative h-40 w-full">
                    <Image 
                        src={img.imageUrl}
                        alt={hackathon.eventName}
                        fill
                        className="rounded-t-lg object-cover"
                        data-ai-hint={img.imageHint}
                    />
                     <Badge 
                        className="absolute top-2 right-2 font-semibold"
                        style={{
                            backgroundColor: `${categoryInfo.color}33`,
                            color: categoryInfo.color,
                            borderColor: categoryInfo.color,
                        }}
                     >
                        {hackathon.category}
                    </Badge>
                </div>
                <CardTitle className="pt-4">{hackathon.eventName}</CardTitle>
                <CardDescription className="line-clamp-3">{hackathon.eventDetails}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex items-center justify-between">
                <CountdownTimer date={hackathon.live ? hackathon.endDate : hackathon.startDate} isUpcoming={!hackathon.live} />
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                <Link href={hackathon.registrationLink} target="_blank" rel="noopener noreferrer">View Hackathon</Link>
                </Button>
            </CardFooter>
        </Card>
        </motion.div>
    )
}

export default function HackathonsPage() {
  const { hackathons, isLoading } = useHackathons();

  if(isLoading) {
    return <HackathonsSkeleton />
  }

  const liveHackathons = hackathons.filter((h) => h.live);
  const upcomingHackathons = hackathons.filter((h) => !h.live);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Hackathons</h1>
      
      <section>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-primary">Live Events</h2>
        {liveHackathons.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No live hackathons right now — our AI will update this section soon!</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Upcoming</h2>
        {upcomingHackathons.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingHackathons.map((hackathon) => (
               <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No upcoming hackathons scheduled — our AI will update this section soon!</p>
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
