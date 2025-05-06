import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isLoggedIn) {
    // Later we would show a login screen instead
    return <div>{children}</div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={cn(
        "flex flex-col flex-grow transition-all duration-300",
        sidebarCollapsed ? "ml-[70px]" : "ml-[250px]"
      )}>
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}