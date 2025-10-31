
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiMentorTranslateAndModerateChat } from '@/ai/flows/ai-mentor-translate-and-moderate-chat';
import { useCurrentProfile, Team, User } from '@/lib/data';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

type Message = {
  id: string;
  user: { id: string; name: string; avatar: string; };
  text: string;
  originalText?: string;
  isProfane?: boolean;
  timestamp?: any;
};


export function Chat({ team }: { team: Team }) {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useCurrentProfile();
  const firestore = useFirestore();

  const messagesRef = useMemoFirebase(() => 
    firestore ? collection(firestore, 'teams', team.id, 'messages') : null
  , [firestore, team.id]);

  const messagesQuery = useMemoFirebase(() => 
    messagesRef ? query(messagesRef, orderBy('timestamp', 'asc')) : null
  , [messagesRef]);

  const { data: messagesData, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  const messages = useMemo(() => {
    return messagesData?.map(m => ({
        ...m,
        user: team.members.find(u => u.id === m.user.id) || m.user,
    })) || []
  }, [messagesData, team.members])


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || !currentUser || !messagesRef) return;

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
        await addDoc(messagesRef, {
            user: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
            },
            text: result.translatedMessage,
            originalText: originalMessage !== result.translatedMessage ? originalMessage : undefined,
            isProfane: result.isProfane,
            timestamp: serverTimestamp(),
        });
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

  return (
    <div className="flex h-[60vh] flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={message.user.avatar} alt={message.user.name} data-ai-hint="person portrait" />
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
