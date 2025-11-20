'use client';

import { ReactNode } from 'react';

interface StoryContainerProps {
  children: ReactNode;
}

export function StoryContainer({ children }: StoryContainerProps) {
  return (
    <div className="bg-white overflow-x-hidden">
      {children}
    </div>
  );
}
