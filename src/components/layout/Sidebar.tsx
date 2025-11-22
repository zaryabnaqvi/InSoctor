import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Shield,
  AlertCircle,
  Terminal,
  BarChart3,
  Settings,
  Share2,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAlerts } from '@/contexts/AlertContext';
import { useUser } from '@/contexts/UserContext';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  subItems?: SubMenuItem[];
  alertCount?: number;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/'
  },
  {
    icon: AlertCircle,
    label: 'SIEM',
    path: '/siem',
    subItems: [
      { label: 'Offense', path: '/alerts' },
      { label: 'Logs', path: '/siem/log' },
      { label: 'Use Case', path: '/siem/rules' }
    ]
  },
  {
    icon: HardDrive,
    label: 'EDR',
    path: '/edr',
    subItems: [
      { label: 'Endpoint Inventory', path: '/endpoints' },
      { label: 'Containment', path: '/edr/containment' },
      { label: 'Sandbox Analysis', path: '/edr/sandbox' },
      { label: 'Malware Scan', path: '/edr/malware-scan' }
    ]
  },
  {
    icon: Terminal,
    label: 'SOAR',
    path: '/soar',
    roles: ['admin', 'analyst'],
    subItems: [
      { label: 'Case Management', path: '/soar/cases' },
      { label: 'Automation', path: '/soar/automation' },
      { label: 'Enrichment', path: '/soar/enrichment' },
      { label: 'Applications', path: '/soar/applications' }
    ]
  },
  {
    icon: Share2,
    label: 'FIM',
    path: '/siem/fim'
  },
  {
    icon: MagnifyingGlassIcon,
    label: 'Vulnerability Management',
    path: '/vulnerability-management'
  },
  {
    icon: BarChart3,
    label: 'Reporting',
    path: '/reporting'
  },
  {
    icon: Globe,
    label: 'Threat Intelligence',
    path: '/threat-intelligence'
  },
  {
    icon: Settings,
    label: 'Administration',
    path: '/users',
    roles: ['admin']
  }
];

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { alerts } = useAlerts();
  const { user } = useUser();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const criticalAlerts = alerts.filter(alert =>
    alert.status === 'open' && alert.severity === 'critical'
  ).length;

  const highAlerts = alerts.filter(alert =>
    alert.status === 'open' && alert.severity === 'high'
  ).length;

  const toggleExpand = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const filteredItems = menuItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-20 transition-all duration-300 shadow-sm",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between px-4 h-[64px] border-b">
        <div className={cn(
          "flex items-center transition-all overflow-hidden",
          collapsed ? "justify-center w-full" : ""
        )}>
          <div className="flex shrink-0 items-center justify-center h-9 w-9 rounded-lg bg-primary mr-2">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span
            className={cn(
              "font-semibold text-lg transition-opacity",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            InSOCtor
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className={cn(
            "h-6 w-6 rounded hover:bg-secondary flex items-center justify-center",
            collapsed ? "rotate-180" : ""
          )}
        >
          {collapsed ? <ChevronRight size={20} className=" text-white" /> : <ChevronLeft size={20} className=" text-white" />}
        </button>
      </div>

      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <TooltipProvider>
          <ul className="space-y-1 px-2">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems[item.path];
              const alertCount = item.label === 'Alerts'
                ? criticalAlerts + highAlerts
                : 0;

              return (
                <li key={item.path}>
                  <div
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="space-y-1"
                  >
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col">
                          <NavLink
                            to={item.path}
                            onClick={(e) => {
                              if (hasSubItems) {
                                e.preventDefault();
                                toggleExpand(item.path);
                              }
                            }}
                            className={({ isActive }) => cn(
                              "flex items-center h-10 text-sm transition-colors rounded-md px-3",
                              "hover:bg-secondary/80",
                              isActive ? "bg-secondary text-foreground font-medium" : "text-muted-foreground",
                              collapsed ? "justify-center" : "justify-between"
                            )}
                          >
                            <div className="flex items-center">
                              <span className="relative flex">
                                <Icon
                                  className={cn(
                                    "h-5 w-5 transition-transform",
                                    hoveredIndex === index ? "scale-110" : "",
                                    collapsed ? "mx-auto" : "mr-3"
                                  )}
                                />
                                {alertCount > 0 && (
                                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {alertCount}
                                  </span>
                                )}
                              </span>
                              {!collapsed && (
                                <span>{item.label}</span>
                              )}
                            </div>
                            {!collapsed && hasSubItems && (
                              <span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </NavLink>

                          {!collapsed && hasSubItems && isExpanded && (
                            <div className="ml-6 space-y-1 mt-1">
                              {item.subItems?.map((subItem) => (
                                <NavLink
                                  key={subItem.path}
                                  to={subItem.path}
                                  className={({ isActive }) => cn(
                                    "flex items-center h-8 text-sm transition-colors rounded-md px-3",
                                    "hover:bg-secondary/60",
                                    isActive ? "bg-secondary/80 text-foreground font-medium" : "text-muted-foreground"
                                  )}
                                >
                                  {subItem.label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                          {alertCount > 0 && (
                            <p className="text-xs text-destructive">{alertCount} active alerts</p>
                          )}
                          {hasSubItems && (
                            <div className="mt-1 text-xs">
                              {item.subItems?.map(sub => (
                                <div key={sub.path}>{sub.label}</div>
                              ))}
                            </div>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      </nav>

      <div className={cn(
        "border-t border-border p-3",
        collapsed ? "text-center" : ""
      )}>
        <div className={cn(
          "text-xs text-muted-foreground",
          collapsed ? "hidden" : "block"
        )}>
          <div className="mb-1 font-medium">Sentinel XDR</div>
          <div>Version 3.5.2</div>
        </div>
      </div>
    </div>
  );
}
