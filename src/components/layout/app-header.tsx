
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentProfile } from '@/lib/data';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export function AppHeader() {
    const { currentUser } = useCurrentProfile();
    const userAvatar = currentUser?.avatar;
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
      if(auth) {
        await signOut(auth);
        router.push('/');
      }
    }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="flex md:hidden" />
      <div className="w-full flex-1">
        {/* Can be used for breadcrumbs or search */}
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              {userAvatar && currentUser && <AvatarImage src={userAvatar} alt={currentUser.name} />}
              {currentUser && <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>}
              {!currentUser && <AvatarFallback>?</AvatarFallback>}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
