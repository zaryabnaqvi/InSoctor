import { Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

export function PageLoader() {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(30);
    }, 100);
    
    const timer2 = setTimeout(() => {
      setProgress(60);
    }, 200);
    
    const timer3 = setTimeout(() => {
      setProgress(90);
    }, 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="animate-pulse mb-4">
        <Shield className="h-12 w-12 text-primary" />
      </div>
      <div className="w-[280px] mb-2">
        <Progress value={progress} className="h-1" />
      </div>
      <p className="text-sm text-muted-foreground">Loading security data...</p>
    </div>
  );
}