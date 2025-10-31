
'use client';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { type UserProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  passion: z.string().min(10, 'Passion must be at least 10 characters'),
  skills: z.string().min(1, 'Please enter at least one skill'),
  availability: z.string().min(1, 'Availability is required'),
  languages: z.string().min(1, 'Please enter at least one language'),
  hackathonInterests: z.string().min(1, 'Please enter at least one interest'),
  avatar: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function EditProfileDialog({ user }: { user: UserProfile }) {
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
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      passion: user.passion,
      skills: user.skills.join(', '),
      availability: user.availability,
      languages: user.languages.join(', '),
      hackathonInterests: user.hackathonInterests.join(', '),
      avatar: user.avatar,
    },
  });

  const onSubmit = (data: ProfileForm) => {
    if (!firestore) return;

    setIsSubmitting(true);
    const userProfileRef = doc(firestore, 'users', user.id);

    const updatedProfile = {
      ...user,
      ...data,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      languages: data.languages.split(',').map(s => s.trim()).filter(Boolean),
      hackathonInterests: data.hackathonInterests.split(',').map(s => s.trim()).filter(Boolean),
    };

    setDocumentNonBlocking(userProfileRef, updatedProfile, { merge: true });

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully saved.',
    });
    
    setIsSubmitting(false);
    setIsOpen(false);
  };
  
  const avatarOptions = PlaceHolderImages.filter(p => p.imageHint.includes('portrait') || p.imageHint.includes('person') || p.imageHint.includes('developer')).slice(0, 8);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <Label>Avatar</Label>
                 <Controller
                    control={control}
                    name="avatar"
                    render={({ field }) => (
                        <div className="grid grid-cols-4 gap-4">
                        {avatarOptions.map(avatar => (
                            <button 
                                key={avatar.id}
                                type="button"
                                onClick={() => field.onChange(avatar.id)}
                                className={cn("rounded-full ring-2 ring-transparent transition-all", field.value === avatar.id && 'ring-primary ring-offset-2 ring-offset-background')}
                            >
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </button>
                        ))}
                        </div>
                    )}
                />
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

    