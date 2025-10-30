import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="rounded-lg bg-primary p-2">
        <Code className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold">Nexus Teams</span>
    </Link>
  );
};

export default Logo;
