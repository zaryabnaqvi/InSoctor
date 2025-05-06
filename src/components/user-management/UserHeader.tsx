import { Bell, Filter, Search, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function UserHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-primary" />
            User Security
          </h1>
          <p className="text-muted-foreground">
            Monitor user activity and identity security across your organization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full md:w-[200px] pl-8"
            />
          </div>
          <Button>Export Report</Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-muted/20">
          All users (503)
        </Badge>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          High risk (12)
        </Badge>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          Medium risk (28)
        </Badge>
        <Badge variant="outline" className="bg-primary/10 border-primary/20">
          Admins (42)
        </Badge>
      </div>
    </div>
  );
}