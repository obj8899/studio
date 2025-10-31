import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <div className="rounded-lg bg-primary p-2">
        <Code className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold">Pulse Point</span>
    </Link>
  );
};

export default Logo;
