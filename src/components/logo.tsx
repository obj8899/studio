
'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = theme === 'dark' 
    ? 'https://placehold.co/36x36/FFFFFF/000000?text=PP' 
    : 'https://placehold.co/36x36/000000/FFFFFF?text=PP';

  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <div className="flex-shrink-0 transition-transform duration-200 hover:scale-105">
        {mounted ? (
            <Image
                src={logoSrc}
                alt="Pulse Point Logo"
                width={36}
                height={36}
                className="rounded-lg"
            />
        ) : (
            <div className="h-9 w-9 bg-muted rounded-lg"></div>
        )}
      </div>
      <span className="text-xl font-bold">Pulse Point</span>
    </Link>
  );
};

export default Logo;
