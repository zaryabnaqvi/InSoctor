import { useEffect, useState } from 'react';
import { Bell, Search, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser } from '@/contexts/UserContext';
import { useAlerts } from '@/contexts/AlertContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useUser();
  const { alerts } = useAlerts();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={cn(
      "sticky top-0 z-10 py-2 px-4 md:px-6 border-b transition-all duration-300",
      scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-sm shadow-sm" : "bg-[#0a0a0a]",
      "border-white/10 text-white"
    )}>
      <div className="flex items-center justify-between h-14">
        <div className={cn(
          "relative transition-all w-[280px] md:w-[400px]",
          searchFocused ? "w-[340px] md:w-[500px]" : ""
        )}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search alerts, devices, users..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 hover:bg-white/10 focus:bg-[#0a0a0a] focus:border-blue-500"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative text-gray-300 hover:text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse border border-[#0a0a0a]">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#1a1a1a] border-white/10 text-white">
              <div className="p-3 border-b border-white/10">
                <h3 className="font-medium">Recent Alerts</h3>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className={cn(
                    "p-3 border-b border-white/10 hover:bg-white/5 transition-colors",
                    alert.severity === 'critical' ? "border-l-4 border-l-red-600" : "",
                    alert.severity === 'high' ? "border-l-4 border-l-orange-600" : ""
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{alert.title}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs font-medium rounded-full px-2 py-1",
                        alert.severity === 'critical' && "bg-red-500/20 text-red-400",
                        alert.severity === 'high' && "bg-orange-500/20 text-orange-400",
                        alert.severity === 'medium' && "bg-yellow-500/20 text-yellow-400",
                        alert.severity === 'low' && "bg-green-500/20 text-green-400",
                        alert.severity === 'info' && "bg-blue-500/20 text-blue-400"
                      )}>
                        {alert.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <Button variant="ghost" className="w-full text-sm text-gray-300 hover:text-white hover:bg-white/5">View all alerts</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" className='aspect-square text-gray-300 hover:text-white hover:bg-white/10'>
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" className='aspect-square text-gray-300 hover:text-white hover:bg-white/10'>
            <Settings className="h-5 w-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-white/10 hover:ring-white/20">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white">{user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-[#1a1a1a] border-white/10 text-white" align="end">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/10">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-blue-600 text-white">{user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-white/5">
                  Profile Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-white/5">
                  Preferences
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={handleLogout}
                >
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