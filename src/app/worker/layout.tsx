'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, HardHat, History, LayoutDashboard, Sparkles, User } from 'lucide-react';

import WorkerHeader from '@/components/worker-header';
import { PWAInstallBanner } from '@/components/pwa-install-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const bottomNavItems = [
  { href: '/worker/dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/worker/task', label: 'Tasks', icon: <ClipboardList className="h-7 w-7" />, isCentral: true },
  { href: '/worker/open-tasks', label: 'Open', icon: <Sparkles className="h-5 w-5" /> },
  { href: '/worker/history', label: 'History', icon: <History className="h-5 w-5" /> },
  { href: '/worker/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/worker/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <WorkerHeader />
      <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 pb-24 md:gap-6 md:p-6 md:pb-6">{children}</main>

      <PWAInstallBanner variant="worker" />

      <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 shadow-lg backdrop-blur-md md:hidden">
        <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-t-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
          <HardHat className="h-3.5 w-3.5" />
          Worker Mobile App
        </div>
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          {bottomNavItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);

            if (item.isCentral) {
              return (
                <div key={item.href} className="flex -mt-8 items-center justify-center">
                  <Link href={item.href} aria-label={item.label}>
                    <Button
                      size="icon"
                      className={cn(
                        'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all duration-200',
                        'hover:scale-105 hover:shadow-2xl active:scale-95',
                        isActive && 'ring-4 ring-amber-500/30 ring-offset-2 ring-offset-background'
                      )}
                    >
                      {item.icon}
                    </Button>
                    <span className="mt-1 block text-center text-[10px] font-medium text-muted-foreground">{item.label}</span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center rounded-xl px-4 py-2 transition-all duration-200',
                  'hover:bg-muted/80 active:scale-95',
                  isActive ? 'bg-amber-500/10 text-amber-600' : 'text-muted-foreground'
                )}
              >
                <div className={cn('rounded-full p-2 transition-colors', isActive && 'bg-amber-500/10')}>{item.icon}</div>
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
