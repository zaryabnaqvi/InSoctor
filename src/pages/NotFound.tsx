import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, HomeIcon } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <Shield className="h-20 w-20 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold tracking-tighter mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The security zone you're looking for couldn't be found. Please check the URL or return to the dashboard.
      </p>
      <Button onClick={() => navigate('/')} className="gap-2">
        <HomeIcon className="h-4 w-4" />
        Return to Dashboard
      </Button>
    </div>
  );
}