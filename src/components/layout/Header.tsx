import { useEffect, useState } from 'react';
import { Bell, Search, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser } from '@/contexts/UserContext';
import { useAlerts } from '@/contexts/AlertContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { user } = useUser();
  const { alerts } = useAlerts();
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const unreadAlerts = alerts.filter(alert => 
    alert.status === 'open' && alert.severity !== 'low' && alert.severity !== 'info'
  ).length;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-10 py-2 px-4 md:px-6 border-b transition-all duration-300",
      scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background",
      "border-border"
    )}>
      <div className="flex items-center justify-between h-14">
        <div className={cn(
          "relative transition-all w-[280px] md:w-[400px]",
          searchFocused ? "w-[340px] md:w-[500px]" : ""
        )}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search alerts, devices, users..." 
            className="pl-10 bg-secondary/50 border-secondary hover:bg-secondary/80 focus:bg-background"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost"  className="relative">
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-3 border-b">
                <h3 className="font-medium">Recent Alerts</h3>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className={cn(
                    "p-3 border-b hover:bg-muted/50 transition-colors",
                    alert.severity === 'critical' ? "border-l-4 border-l-destructive" : "",
                    alert.severity === 'high' ? "border-l-4 border-l-orange-600" : ""
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs font-medium rounded-full px-2 py-1",
                        alert.severity === 'critical' && "bg-destructive/20 text-destructive",
                        alert.severity === 'high' && "bg-orange-500/20 text-orange-500",
                        alert.severity === 'medium' && "bg-yellow-500/20 text-yellow-500",
                        alert.severity === 'low' && "bg-green-500/20 text-green-500",
                        alert.severity === 'info' && "bg-blue-500/20 text-blue-500"
                      )}>
                        {alert.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t">
                <Button variant="ghost" className="w-full text-sm">View all alerts</Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost"  className='aspect-square'>
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" className='aspect-square'>
            <Settings className="h-5 w-5" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Profile Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Preferences
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Sign out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}