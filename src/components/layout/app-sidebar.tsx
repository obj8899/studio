
'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Search,
  Settings,
  User,
  Bot,
  Rocket,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hackathons', label: 'Hackathons', icon: Trophy },
  { href: '/find-teams', label: 'Find Teams', icon: Search },
  { href: '/ai-mentor', label: 'AI Mentor', icon: Bot },
  { href: '/teams', label: 'My Teams', icon: Users },
  { href: '/requests', label: 'Requests', icon: Inbox },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/coming-soon', label: 'Coming Soon', icon: Rocket },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }


  return (
    <>
    
        <Sidebar>
        <SidebarHeader>
            <Logo href="/" />
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    onClick={() => setOpenMobile(false)}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/profile')}>
                        <Link href="/profile">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        </Sidebar>
    
    </>
  );
}
