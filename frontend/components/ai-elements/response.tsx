'use client';

import { cn } from '@/lib/utils';
import { memo } from 'react';

type ResponseProps = {
  className?: string;
  isStreaming?: boolean;
  content?: string;
};

export const Response = memo(
  ({ className, isStreaming, content }: ResponseProps) => (
    <div
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
    >
      {content || ''}
    </div>
  ),
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

Response.displayName = 'Response';
