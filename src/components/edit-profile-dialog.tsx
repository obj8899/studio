
'use client';
import { useState, useRef } from 'react';
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
import { Edit, Upload } from 'lucide-react';
import { useFirestore, useStorage } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { type UserProfile } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  passion: z.string().min(10, 'Passion must be at least 10 characters'),
  skills: z.string().min(1, 'Please enter at least one skill'),
  availability: z.string().min(1, 'Availability is required'),
  languages: z.string().min(1, 'Please enter at least one language'),
  hackathonInterests: z.string().min(1, 'Please enter at least one interest'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function EditProfileDialog({ user }: { user: UserProfile }) {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const userAvatarPlaceholder = PlaceHolderImages.find(p => p.id === user.avatar);
  const initialAvatarUrl = userAvatarPlaceholder ? userAvatarPlaceholder.imageUrl : user.avatar;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!firestore || !storage) return;

    setIsSubmitting(true);
    let avatarUrl = user.avatar; // Keep original avatar if not changed

    try {
      // 1. Upload new avatar if one is selected
      if (avatarFile) {
        // Use a consistent path to overwrite the old avatar
        const fileRef = storageRef(storage, `avatars/${user.id}/profile-picture`);
        const uploadResult = await uploadBytes(fileRef, avatarFile);
        avatarUrl = await getDownloadURL(uploadResult.ref);
      }

      // 2. Prepare the updated profile data
      const updatedProfile = {
        ...user,
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: data.languages.split(',').map(s => s.trim()).filter(Boolean),
        hackathonInterests: data.hackathonInterests.split(',').map(s => s.trim()).filter(Boolean),
        avatar: avatarUrl, // Use new URL or original one
      };

      // 3. Save the updated profile to Firestore
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
            setAvatarFile(null);
            setAvatarPreview(initialAvatarUrl);
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
            <div className="space-y-2 flex flex-col items-center">
                <Label>Avatar</Label>
                <Avatar className="h-32 w-32 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview && <AvatarImage src={avatarPreview} alt={user.name} />}
                    <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleAvatarChange}
                    accept="image/png, image/jpeg"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload Photo</Button>
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
