'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import GoogleIcon from '@/components/icons/google';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { handleGoogleSignIn } from '@/firebase/auth/google-auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const onGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    const success = await handleGoogleSignIn(auth, firestore);
    if (success) {
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: 'Could not sign up with Google. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const [firstName, ...lastName] = fullName.split(' ');

        const userProfileRef = doc(firestore, 'users', user.uid);
        const newUserProfile = {
          id: user.uid,
          email: user.email,
          firstName: firstName || '',
          lastName: lastName.join(' ') || '',
          skills: ['React', 'TypeScript'],
          passion: 'Developing innovative web solutions',
          availability: '10-15 hours/week',
          languages: ['English'],
          hackathonInterests: ['AI', 'Web Dev'],
          socialLinks: [],
          pulseIndex: 75,
          avatar: String(Math.floor(Math.random() * 4) + 1),
        };

        // Non-blocking write
        setDoc(userProfileRef, newUserProfile).catch((error) => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: userProfileRef.path,
              operation: 'create',
              requestResourceData: newUserProfile,
            })
          );
        });

        toast({
          title: 'Account Created',
          description: 'Welcome to Pulse Point!',
        });
        router.push('/dashboard');
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Sign-up Failed',
          description:
            error.message || 'Could not create account. Please try again.',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Join Pulse Point and start building amazing things.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    placeholder="Ada Lovelace"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={isLoading}
                >
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Sign up with Google
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
