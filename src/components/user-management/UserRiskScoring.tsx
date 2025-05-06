import { AlertTriangle, ArrowDown, ArrowUp, PieChart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UserRiskScoringProps {
  showDetails?: boolean;
}

export function UserRiskScoring({ showDetails = false }: UserRiskScoringProps) {
  const riskData = [
    { category: 'High', count: 12, percentage: 2.4, trend: 'down' },
    { category: 'Medium', count: 28, percentage: 5.6, trend: 'up' },
    { category: 'Low', count: 463, percentage: 92.0, trend: 'down' }
  ];

  const riskFactors = [
    { 
      name: 'Authentication Anomalies', 
      score: 35, 
      description: 'Unusual login times, locations, or multiple failures', 
      trend: 'up' 
    },
    { 
      name: 'Privilege Escalations', 
      score: 28, 
      description: 'Attempts to gain higher access rights', 
      trend: 'down' 
    },
    { 
      name: 'Data Access Patterns', 
      score: 22, 
      description: 'Abnormal access to sensitive data', 
      trend: 'up' 
    },
    { 
      name: 'Security Policy Violations', 
      score: 15, 
      description: 'Non-compliance with security policies', 
      trend: 'down' 
    }
  ];

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">User Risk Scoring</CardTitle>
        <CardDescription>
          Risk assessment based on behavior analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {riskData.map((risk) => (
            <div key={risk.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={
                    risk.category === 'High' ? 'text-destructive' : 
                    risk.category === 'Medium' ? 'text-amber-500' : 
                    'text-green-500'
                  }>
                    {risk.category === 'High' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : risk.category === 'Medium' ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{risk.category} Risk</span>
                </div>
                <div className="flex items-center text-xs">
                  {risk.trend === 'down' ? (
                    <ArrowDown className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowUp className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold">{risk.count}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({risk.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={risk.percentage} 
                className={
                  risk.category === 'High' ? 'bg-destructive/20' : 
                  risk.category === 'Medium' ? 'bg-amber-500/20' : 
                  'bg-green-500/20'
                }
              />
            </div>
          ))}
        </div>

        {showDetails && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium">Risk Factor Breakdown</h3>
            </div>
            
            <div className="space-y-4">
              {riskFactors.map((factor, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">{factor.score}%</span>
                      {factor.trend === 'up' ? (
                        <ArrowUp className="h-3 w-3 text-destructive" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}