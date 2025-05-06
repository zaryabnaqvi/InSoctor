import { cn, getScoreColor } from '@/lib/utils';

interface AlertScoreProps {
  score: number;
  className?: string;
}

export function AlertScore({ score, className }: AlertScoreProps) {
  return (
    <div 
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold", 
        getScoreColor(score),
        className
      )}
    >
      {score}
    </div>
  );
}