
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { type UserProfile } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  passion: z.string().min(10, 'Passion must be at least 10 characters'),
  skills: z.string().min(1, 'Please enter at least one skill'),
  availability: z.string().min(1, 'Availability is required'),
  languages: z.string().min(1, 'Please enter at least one language'),
  hackathonInterests: z.string().min(1, 'Please enter at least one interest'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const avatarOptions = PlaceHolderImages.filter(img => img.imageHint.includes('portrait') || img.imageHint.includes('developer')).slice(0, 6);


export function EditProfileDialog({ user }: { user: UserProfile }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(user.avatar);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      passion: user.passion,
      skills: user.skills.join(', '),
      availability: user.availability,
      languages: user.languages.join(', '),
      hackathonInterests: user.hackathonInterests.join(', '),
    },
  });
  
  const onSubmit = async (data: ProfileForm) => {
    if (!firestore) return;

    setIsSubmitting(true);

    try {
      const updatedProfile = {
        ...user,
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: data.languages.split(',').map(s => s.trim()).filter(Boolean),
        hackathonInterests: data.hackathonInterests.split(',').map(s => s.trim()).filter(Boolean),
        avatar: selectedAvatarId,
      };

      const userProfileRef = doc(firestore, 'users', user.id);
      setDocumentNonBlocking(userProfileRef, updatedProfile, { merge: true });

      toast({
        title: 'Profile Update Initiated',
        description: 'Your profile is being updated in the background.',
      });
      
      setIsOpen(false);

    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An error occurred while saving your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            reset();
            setSelectedAvatarId(user.avatar);
        }
    }}>
      <DialogTrigger asChild>
        <Button size="lg"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Choose your Avatar</Label>
                <div className="grid grid-cols-6 gap-2">
                    {avatarOptions.map(avatar => (
                        <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setSelectedAvatarId(avatar.id)}
                            className={cn(
                                "rounded-full p-1 transition-all",
                                selectedAvatarId === avatar.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-2 hover:ring-primary/50'
                            )}
                        >
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passion">Passion / Bio</Label>
              <Textarea id="passion" {...register('passion')} />
              {errors.passion && <p className="text-sm text-destructive">{errors.passion.message}</p>}
            </div>

             <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" {...register('skills')} placeholder="React, Figma, Python" />
              {errors.skills && <p className="text-sm text-destructive">{errors.skills.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Input id="availability" {...register('availability')} placeholder="10-15 hours/week" />
                    {errors.availability && <p className="text-sm text-destructive">{errors.availability.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input id="languages" {...register('languages')} placeholder="English, Spanish"/>
                    {errors.languages && <p className="text-sm text-destructive">{errors.languages.message}</p>}
                </div>
            </div>

             <div className="space-y-2">
              <Label htmlFor="hackathonInterests">Hackathon Interests (comma-separated)</Label>
              <Input id="hackathonInterests" {...register('hackathonInterests')} placeholder="AI, Web Dev, Mobile" />
              {errors.hackathonInterests && <p className="text-sm text-destructive">{errors.hackathonInterests.message}</p>}
            </div>


            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
