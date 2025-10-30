
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentProfile } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Activity, Edit, Languages, Lightbulb, UserCheck, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { currentUser, isLoading } = useCurrentProfile();

    if(isLoading) {
        return <ProfileSkeleton />
    }

    if(!currentUser) {
        return <div className="text-center py-10">Could not load user profile. Please try again later.</div>
    }

    const userAvatar = PlaceHolderImages.find(img => img.id === currentUser.avatar);

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32 border-4 border-primary">
                        {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={currentUser.name} />}
                        <AvatarFallback className="text-4xl">{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{currentUser.name}</h1>
                        <p className="text-muted-foreground">{currentUser.passion}</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                            {currentUser.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                        </div>
                    </div>
                    <Button size="lg"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Activity className="text-primary"/> Pulse Index</CardTitle>
                            <CardDescription>Your collaboration and activity score.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-4">
                                <span className="text-5xl font-bold text-primary">{currentUser.pulseIndex}</span>
                                <div className="flex-1">
                                    <Progress value={currentUser.pulseIndex} className="h-3"/>
                                    <p className="text-sm text-muted-foreground mt-2">You're in the top 12% of users this month!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/> Hackathon Interests</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                             {currentUser.interests.map(interest => (
                                <Badge key={interest} variant="secondary" className="px-3 py-1 text-sm">{interest}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                           <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Availability</p>
                                    <p className="text-muted-foreground">{currentUser.availability}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <Languages className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Languages</p>
                                    <p className="text-muted-foreground">{currentUser.languages?.join(', ') || 'Not specified'}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Communication Style</p>
                                    <p className="text-muted-foreground">Prefers async communication</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


function ProfileSkeleton() {
    return (
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-5 w-64 mx-auto md:mx-0" />
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <Skeleton className="h-12 w-36" />
          </CardContent>
        </Card>
  
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32" /></div></div>
                <div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32" /></div></div>
                <div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32" /></div></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
