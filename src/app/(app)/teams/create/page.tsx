'use client';
import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { useCurrentProfile } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters'),
  openRoles: z.array(z.string().min(1, 'Role cannot be empty')).min(1, 'At least one open role is required'),
  requiredSkills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one required skill is required'),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

export default function CreateTeamPage() {
  const { currentUser } = useCurrentProfile();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      projectDescription: '',
      openRoles: [''],
      requiredSkills: [''],
    },
  });

  const { fields: openRolesFields, append: appendOpenRole, remove: removeOpenRole } = useFieldArray({
    control,
    name: 'openRoles',
  });

  const { fields: requiredSkillsFields, append: appendRequiredSkill, remove: removeRequiredSkill } = useFieldArray({
    control,
    name: 'requiredSkills',
  });

  const onSubmit = async (data: CreateTeamForm) => {
    if (!currentUser || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to create a team.",
        });
      return;
    }
    
    setIsSubmitting(true);

    try {
        const teamsCol = collection(firestore, 'teams');
        const newTeamDoc = {
            ...data,
            logo: String(Math.floor(Math.random() * 3) + 5), // placeholder logo
            teamMemberIds: [currentUser.id],
            createdAt: serverTimestamp(),
        };

        const docRef = await addDocumentNonBlocking(teamsCol, newTeamDoc);

        toast({
            title: "Team Created!",
            description: "Your new team has been successfully created.",
        });
        
        // Use a small delay to allow firestore to propagate the change before navigating
        setTimeout(() => {
          if(docRef?.id) {
            router.push(`/teams/${docRef.id}`);
          } else {
            router.push('/teams');
          }
        }, 500);

    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Create Team',
        description: 'An unexpected error occurred. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Team</CardTitle>
          <CardDescription>Assemble your squad and start building something amazing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input id="name" {...register('name')} placeholder="e.g., The Code Crusaders" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea id="projectDescription" {...register('projectDescription')} placeholder="Describe the project your team will be working on." />
              {errors.projectDescription && <p className="text-sm text-destructive">{errors.projectDescription.message}</p>}
            </div>
            
            <div className="space-y-4">
                <Label>Open Roles</Label>
                {openRolesFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input {...register(`openRoles.${index}`)} placeholder="e.g., Frontend Developer" />
                        {index > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeOpenRole(index)}><X className="h-4 w-4" /></Button>}
                    </div>
                ))}
                 {errors.openRoles && <p className="text-sm text-destructive">{errors.openRoles.message || errors.openRoles.root?.message}</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => appendOpenRole('')}><Plus className="mr-2 h-4 w-4" /> Add Role</Button>
            </div>

            <div className="space-y-4">
                <Label>Required Skills</Label>
                {requiredSkillsFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input {...register(`requiredSkills.${index}`)} placeholder="e.g., React, Node.js" />
                        {index > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeRequiredSkill(index)}><X className="h-4 w-4" /></Button>}
                    </div>
                ))}
                 {errors.requiredSkills && <p className="text-sm text-destructive">{errors.requiredSkills.message || errors.requiredSkills.root?.message}</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => appendRequiredSkill('')}><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
            </div>


            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating Team...' : 'Create Team'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
