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
      "sticky top-0 z-10 py-3 px-4 md:px-6 transition-all duration-300",
      scrolled
        ? "glass-subtle shadow-soft-md border-b border-white/10"
        : "bg-[#0a0f1e]/80 backdrop-blur-sm border-b border-white/5"
    )}>
      <div className="flex items-center justify-between h-12">
        {/* Search Bar */}
        <div className={cn(
          "relative transition-all duration-300",
          searchFocused ? "w-[340px] md:w-[500px]" : "w-[280px] md:w-[400px]"
        )}>
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
            searchFocused ? "text-cyan-400" : "text-slate-400"
          )} />
          <Input
            placeholder="Search alerts, devices, users..."
            className={cn(
              "pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500",
              "rounded-xl transition-all duration-300",
              "hover:bg-white/10 hover:border-white/20",
              "focus:bg-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Alerts Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "relative h-10 w-10 rounded-xl bg-white/5 border border-white/10",
                  "text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30",
                  "transition-all duration-300 hover:shadow-glow group"
                )}
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse border-2 border-[#0a0f1e] shadow-glow">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 glass-card border-white/10 text-white animate-scale-in">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Recent Alerts</h3>
                <p className="text-xs text-slate-400 mt-1">{unreadAlerts} unread notifications</p>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className={cn(
                    "p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group",
                    alert.severity === 'critical' && "border-l-2 border-l-red-500",
                    alert.severity === 'high' && "border-l-2 border-l-orange-500"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white group-hover:text-cyan-400 transition-colors">
                          {alert.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs font-medium rounded-lg px-2 py-1 ml-2",
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
                <Button
                  variant="ghost"
                  className="w-full h-9 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                  onClick={() => navigate('/alerts')}
                >
                  View all alerts
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Help Button */}
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-10 rounded-xl bg-white/5 border border-white/10",
              "text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30",
              "transition-all duration-300 hover:shadow-glow group"
            )}
          >
            <HelpCircle className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-10 rounded-xl bg-white/5 border border-white/10",
              "text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30",
              "transition-all duration-300 hover:shadow-glow group"
            )}
            onClick={() => navigate('/users')}
          >
            <Settings className="h-5 w-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
          </Button>

          {/* User Profile */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-10 w-10 rounded-xl p-0",
                  "ring-2 ring-white/10 hover:ring-cyan-500/50",
                  "transition-all duration-300 hover:shadow-glow"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-semibold">
                    {user?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 glass-card border-white/10 text-white animate-scale-in" align="end">
              {/* User Info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-cyan-500/30">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                      {user?.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{user?.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full h-9 justify-start rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Profile Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-9 justify-start rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Preferences
                </Button>
                <div className="h-px bg-white/10 my-2"></div>
                <Button
                  variant="ghost"
                  className="w-full h-9 justify-start rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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