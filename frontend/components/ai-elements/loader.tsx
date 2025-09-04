'use client';

import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import type { ComponentProps } from 'react';

export type LoaderProps = ComponentProps<'div'> & {
  size?: 'sm' | 'md' | 'lg';
};

export const Loader = ({ className, size = 'md', ...props }: LoaderProps) => {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <Loader2Icon className={cn(
        sizeClasses[size],
        'animate-spin text-muted-foreground'
      )} />
    </div>
  );
};
