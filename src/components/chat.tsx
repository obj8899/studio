'use client';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiMentorTranslateAndModerateChat } from '@/ai/flows/ai-mentor-translate-and-moderate-chat';
import { currentUser, users as allUsers, Team } from '@/lib/data';
import { Send, ShieldAlert } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  user: { id: string; name: string; avatar: string; };
  text: string;
  originalText?: string;
  isProfane?: boolean;
};

const initialMessages: Message[] = [
    {
        id: 'msg-1',
        user: allUsers[1],
        text: 'Hey team, I\'ve pushed the latest changes for the auth flow. Can someone review?',
    },
    {
        id: 'msg-2',
        user: allUsers[2],
        text: 'Sure, I can take a look now.',
    }
];


export function Chat({ team }: { team: Team }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const originalMessage = newMessage;
    setNewMessage('');

    try {
      const result = await aiMentorTranslateAndModerateChat({ message: originalMessage });
      
      if (result.isProfane) {
        toast({
            variant: "destructive",
            title: "Message Blocked",
            description: "Your message was flagged for profanity and was not sent.",
        })
      } else {
        const message: Message = {
          id: `msg-${Date.now()}`,
          user: currentUser,
          text: result.translatedMessage,
          originalText: originalMessage !== result.translatedMessage ? originalMessage : undefined,
          isProfane: result.isProfane,
        };
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Failed to moderate or translate message', error);
       toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send message. Please try again.",
       });
       setNewMessage(originalMessage); // Re-set the message in the input
    } finally {
      setIsLoading(false);
    }
  };

  const getUserImage = (id: string) => PlaceHolderImages.find(p => p.id === id);

  return (
    <div className="flex h-[60vh] flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={getUserImage(message.user.avatar)?.imageUrl} alt={message.user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{message.user.name}</p>
                <div className="rounded-lg bg-secondary p-3 text-sm">
                  {message.isProfane ? (
                    <span className="italic text-destructive">Message blocked due to profanity.</span>
                  ) : (
                    <p>{message.text}</p>
                  )}
                  {message.originalText && (
                    <p className="text-xs italic text-muted-foreground mt-1">(translated from: {message.originalText})</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
