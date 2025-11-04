
'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { type UserProfile, type Team } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const requestJoinSchema = z.object({
  role: z.string().min(1, 'Please select a role'),
  skillsSummary: z.string().min(20, 'Please provide a brief summary of your skills (min. 20 characters)'),
});

type RequestJoinForm = z.infer<typeof requestJoinSchema>;

export function RequestToJoinDialog({
  user,
  team,
  defaultRole,
  children
}: {
  user: UserProfile;
  team: Omit<Team, 'members'>;
  defaultRole?: string;
  children: React.ReactNode;
}) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RequestJoinForm>({
    resolver: zodResolver(requestJoinSchema),
    defaultValues: {
      role: defaultRole || '',
      skillsSummary: `I'm proficient in: ${user.skills.join(', ')}. I'm passionate about ${user.passion}.`,
    },
  });

  useEffect(() => {
    if (defaultRole) {
        reset({ role: defaultRole, skillsSummary: `I'm proficient in: ${user.skills.join(', ')}. I'm passionate about ${user.passion}.` });
    }
  }, [defaultRole, reset, user]);

  const onSubmit = async (data: RequestJoinForm) => {
    if (!firestore) return;

    setIsSubmitting(true);

    try {
      const requestsCol = collection(firestore, 'joinRequests');
      const newRequest = {
        teamId: team.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userEmail: user.email,
        role: data.role,
        skillsSummary: data.skillsSummary,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDocumentNonBlocking(requestsCol, newRequest);

      toast({
        title: 'Request Sent!',
        description: `Your request to join ${team.name} has been sent.`,
      });
      setIsOpen(false);
    } catch (error) {
        // The error emitter is handled in addDocumentNonBlocking
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request to Join {team.name}</DialogTitle>
          <DialogDescription>
            Select the role you're applying for and add a brief message.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Applying for Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {team.openRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillsSummary">Skill Summary</Label>
            <Textarea
              id="skillsSummary"
              {...register('skillsSummary')}
              placeholder="Briefly tell the team why you'd be a great fit."
              rows={4}
            />
            {errors.skillsSummary && <p className="text-sm text-destructive">{errors.skillsSummary.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
