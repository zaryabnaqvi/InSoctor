import { cn } from '@/lib/utils';

const attackPhases = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact'
];

interface AttackPhaseIndicatorProps {
  phase: string;
  className?: string;
}

export function AttackPhaseIndicator({ phase, className }: AttackPhaseIndicatorProps) {
  // Split combined phases
  const activePhases = phase.split(', ');
  
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {attackPhases.map((p, index) => {
        const isActive = activePhases.includes(p);
        const isLast = index === attackPhases.length - 1;
        
        return (
          <div key={p} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full",
                  isActive ? "bg-red-500" : "bg-gray-300"
                )}
              />
              {isActive && (
                <div className="text-xs mt-0.5 absolute -bottom-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {p}
                </div>
              )}
            </div>
            {!isLast && (
              <div className={cn(
                "h-0.5 w-2", 
                activePhases.includes(attackPhases[index + 1]) && isActive 
                  ? "bg-red-500" 
                  : "bg-gray-300"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}