import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function TabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="app">{children}</div>
      <BottomNav />
    </>
  );
}
