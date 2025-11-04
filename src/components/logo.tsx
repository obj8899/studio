
'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Code } from 'lucide-react';

const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0',
        className
      )}
    >
      <div className="flex-shrink-0 rounded-md bg-primary p-1.5 transition-transform duration-200 hover:scale-105">
        <Code className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">
        Pulse Point
      </span>
    </Link>
  );
};

export default Logo;
