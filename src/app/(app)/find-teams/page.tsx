'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { currentUser, teams } from '@/lib/data';
import { suggestTeamsBasedOnProfile } from '@/ai/flows/suggest-teams-based-on-profile';
import type { SuggestTeamsBasedOnProfileOutput } from '@/ai/flows/suggest-teams-based-on-profile';
import { Bot, ThumbsUp, Zap } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';

type SuggestedTeam = SuggestTeamsBasedOnProfileOutput[0] & {
  logo: string;
  projectDescription: string;
  openRoles: string[];
};

export default function FindTeamsPage() {
  const [suggestedTeams, setSuggestedTeams] = useState<SuggestedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestTeams = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestedTeams([]);

    try {
      const teamProfiles = teams.map(team => ({
        teamName: team.name,
        projectDescription: team.projectDescription,
        openRoles: team.openRoles,
        requiredSkills: team.requiredSkills,
      }));

      const suggestions = await suggestTeamsBasedOnProfile({
        userSkills: currentUser.skills,
        userPassion: currentUser.passion,
        userAvailability: currentUser.availability,
        teamProfiles,
      });

      const enrichedSuggestions = suggestions.map((suggestion) => {
        const originalTeam = teams.find(t => t.name === suggestion.teamName);
        return {
          ...suggestion,
          logo: originalTeam?.logo || '',
          projectDescription: originalTeam?.projectDescription || '',
          openRoles: originalTeam?.openRoles || [],
        };
      });

      setSuggestedTeams(enrichedSuggestions);
    } catch (e) {
      console.error(e);
      setError('Failed to get team suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center text-center">
        <Bot className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">AI Team Finder</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Let our AI analyze your profile and suggest the best teams for you to join. Find your perfect match and start building.
        </p>
        <Button onClick={handleSuggestTeams} disabled={isLoading} size="lg" className="mt-8">
          {isLoading ? (
            'Analyzing...'
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" /> Suggest Teams for Me
            </>
          )}
        </Button>
      </div>

      {error && <p className="mt-8 text-center text-destructive">{error}</p>}

      {suggestedTeams.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-center">Your Top Matches</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestedTeams.sort((a,b) => b.matchScore - a.matchScore).map((team) => {
              const teamImage = PlaceHolderImages.find(p => p.id === team.logo);
              return (
                <Card key={team.teamName} className="flex flex-col">
                  <CardHeader className="flex-row items-center gap-4">
                     {teamImage && <Image src={teamImage.imageUrl} alt={team.teamName} width={64} height={64} className="rounded-lg" data-ai-hint={teamImage.imageHint} />}
                    <div>
                      <CardTitle>{team.teamName}</CardTitle>
                      <CardDescription className="line-clamp-2">{team.projectDescription}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div>
                        <div className="mb-2 flex justify-between items-baseline">
                            <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                             <span className="text-lg font-bold text-primary">{team.matchScore}%</span>
                        </div>
                        <Progress value={team.matchScore} className="h-2" />
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium">AI Rationale</h4>
                      <p className="text-sm text-muted-foreground">{team.rationale}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Open Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {team.openRoles.map((role) => (
                          <Badge key={role} variant="secondary">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <ThumbsUp className="mr-2 h-4 w-4" /> Request to Join
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      {!isLoading && suggestedTeams.length === 0 && (
        <div className="mt-16 text-center text-muted-foreground">
          <p>Click the button to get your personalized team suggestions!</p>
        </div>
      )}
    </div>
  );
}
