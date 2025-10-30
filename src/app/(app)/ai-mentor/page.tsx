
'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentProfile, useTeams } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { suggestTeamsBasedOnProfile } from '@/ai/flows/suggest-teams-based-on-profile';
import { aiMentorFaq } from '@/ai/flows/ai-mentor-faq';
import Link from 'next/link';
import Image from 'next/image';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
};

export default function AiMentorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { currentUser } = useCurrentProfile();
  const { teams } = useTeams();

  const userAvatar = currentUser ? PlaceHolderImages.find(img => img.id === currentUser.avatar) : null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const faqResponse = await aiMentorFaq({ query: currentInput });
        const assistantMessage: ChatMessage = { role: 'assistant', content: faqResponse.answer };
        setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error with AI Mentor:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestTeams = async () => {
    if(!currentUser) return;
    const prompt = 'Suggest some teams for me';
    const userMessage: ChatMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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

      const assistantMessageContent = (
        <div className="space-y-4">
          <p>Based on your profile, here are some teams you might be interested in:</p>
          <div className="grid grid-cols-1 gap-4">
            {suggestions.slice(0, 2).map(team => {
                const originalTeam = teams.find(t => t.name === team.teamName);
                const teamImage = PlaceHolderImages.find(p => p.id === originalTeam?.logo);
                return(
                    <Card key={team.teamName}>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                             {teamImage && <Image src={teamImage.imageUrl} alt={team.teamName} width={40} height={40} className="rounded-lg" data-ai-hint={teamImage.imageHint} />}
                            <CardTitle className="text-lg">{team.teamName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{team.rationale}</p>
                            <Button size="sm" asChild>
                                <Link href={`/teams/${originalTeam?.id}`}>View Team</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
          </div>
        </div>
      );

      const assistantMessage: ChatMessage = { role: 'assistant', content: assistantMessageContent };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error suggesting teams:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I had trouble finding team suggestions. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="container mx-auto max-w-3xl py-8 px-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center">
                <Bot className="h-24 w-24 text-primary" />
                <h1 className="mt-4 text-3xl font-bold">AI Mentor</h1>
                <p className="mt-2 text-muted-foreground">Ask me anything about finding teams, hackathons, or campus collaboration!</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSuggestTeams} disabled={isLoading || !currentUser}>
                        <Zap className="mr-2" /> Suggest Teams For Me
                    </Button>
                     <Button variant="outline" onClick={() => {
                        const userMessage: ChatMessage = { role: 'user', content: 'What are some active hackathons?' };
                        setMessages(prev => [...prev, userMessage]);
                         handleSendMessage({ preventDefault: () => {}, } as React.FormEvent);
                     }}>
                        <MessageSquare className="mr-2" /> What are some active hackathons?
                    </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="border-2 border-primary">
                        <AvatarFallback>
                          <Bot />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-lg rounded-xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                    </div>
                     {message.role === 'user' && currentUser && (
                      <Avatar>
                        {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={currentUser.name} />}
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="border-2 border-primary">
                            <AvatarFallback>
                            <Bot />
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-lg rounded-xl bg-secondary px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0.2s]"></div>
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t bg-background">
        <div className="container mx-auto max-w-3xl p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI Mentor..."
                disabled={isLoading}
                className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="mr-2" /> Send
            </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
