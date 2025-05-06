import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThreatLocation = {
  id: string;
  country: string;
  city: string;
  coordinates: [number, number]; // [x, y] coordinates as percentages
  type: 'attack' | 'ransomware' | 'malware' | 'phishing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
};

// Mock data for threat locations
const mockThreatLocations: ThreatLocation[] = [
  { 
    id: '1', 
    country: 'Russia', 
    city: 'Moscow', 
    coordinates: [58, 30], 
    type: 'attack', 
    severity: 'critical',
    count: 156
  },
  { 
    id: '2', 
    country: 'China', 
    city: 'Beijing', 
    coordinates: [73, 37], 
    type: 'malware', 
    severity: 'high',
    count: 89
  },
  { 
    id: '3', 
    country: 'North Korea', 
    city: 'Pyongyang', 
    coordinates: [76, 35], 
    type: 'ransomware', 
    severity: 'critical',
    count: 48
  },
  { 
    id: '4', 
    country: 'Iran', 
    city: 'Tehran', 
    coordinates: [54, 40], 
    type: 'phishing', 
    severity: 'medium',
    count: 72
  },
  { 
    id: '5', 
    country: 'Brazil', 
    city: 'Sao Paulo', 
    coordinates: [30, 65], 
    type: 'malware', 
    severity: 'high',
    count: 38
  },
  { 
    id: '6', 
    country: 'USA', 
    city: 'New York', 
    coordinates: [23, 38], 
    type: 'phishing', 
    severity: 'low',
    count: 27
  },
  { 
    id: '7', 
    country: 'Germany', 
    city: 'Berlin', 
    coordinates: [47, 33], 
    type: 'attack', 
    severity: 'medium',
    count: 31
  },
  { 
    id: '8', 
    country: 'India', 
    city: 'New Delhi', 
    coordinates: [63, 45], 
    type: 'malware', 
    severity: 'medium',
    count: 45
  },
];

export function ThreatMap() {
  const [selectedThreat, setSelectedThreat] = useState<ThreatLocation | null>(null);
  const [activeThreats, setActiveThreats] = useState<ThreatLocation[]>([]);
  
  useEffect(() => {
    // Initialize with all threats
    setActiveThreats(mockThreatLocations);
    
    // Simulate new threats appearing occasionally
    const interval = setInterval(() => {
      const randomThreat = mockThreatLocations[Math.floor(Math.random() * mockThreatLocations.length)];
      setActiveThreats(prev => {
        const threatExists = prev.some(t => t.id === randomThreat.id);
        if (threatExists) return prev;
        return [...prev, randomThreat];
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handleThreatClick = (threat: ThreatLocation) => {
    setSelectedThreat(threat);
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Global Threat Intelligence</CardTitle>
          <CardDescription>Live attack sources and threat activity</CardDescription>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-destructive mr-2"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
            <span>High</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <span>Low</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] w-full bg-card overflow-hidden rounded-lg border">
          <div className="absolute inset-0 opacity-20">
            <Globe className="h-full w-full text-muted-foreground" />
          </div>
          
          {/* World map would go here - using a simplified placeholder */}
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3961087/pexels-photo-3961087.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')] opacity-20 bg-no-repeat bg-cover">
          </div>
          
          {/* Threat indicators */}
          {activeThreats.map(threat => (
            <div 
              key={threat.id}
              onClick={() => handleThreatClick(threat)}
              className={`absolute cursor-pointer group`}
              style={{
                left: `${threat.coordinates[0]}%`,
                top: `${threat.coordinates[1]}%`,
              }}
            >
              <div className={`
                h-3 w-3 rounded-full ${getSeverityColor(threat.severity)} 
                animate-ping absolute inline-flex opacity-75
              `}></div>
              <div className={`
                h-3 w-3 rounded-full ${getSeverityColor(threat.severity)} 
                relative inline-flex
              `}></div>
              
              <div className="
                opacity-0 group-hover:opacity-100 absolute left-4 top-0 
                bg-background border rounded px-2 py-1 text-xs z-10
                transition-opacity shadow-lg
              ">
                <div className="font-semibold">{threat.city}, {threat.country}</div>
                <div className="text-muted-foreground">{threat.type} ({threat.count})</div>
              </div>
            </div>
          ))}
          
          {/* Selected threat details */}
          {selectedThreat && (
            <div className="absolute bottom-4 right-4 w-80 bg-card rounded-lg shadow-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{selectedThreat.city}, {selectedThreat.country}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedThreat.type} Threats</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  selectedThreat.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                  selectedThreat.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                  selectedThreat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-green-500/20 text-green-500'
                }`}>
                  {selectedThreat.severity}
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-secondary rounded-md">
                  <p className="text-xs text-muted-foreground">Active Threats</p>
                  <p className="text-lg font-semibold">{selectedThreat.count}</p>
                </div>
                <div className="text-center p-2 bg-secondary rounded-md">
                  <p className="text-xs text-muted-foreground">First Seen</p>
                  <p className="text-sm font-semibold">3 days ago</p>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <button 
                  className="text-xs text-primary hover:underline"
                  onClick={() => setSelectedThreat(null)}
                >
                  View Details
                </button>
              </div>
            </div>
          )}
          
          {/* Connection lines would be added here with SVG in a real implementation */}
        </div>
      </CardContent>
    </Card>
  );
}