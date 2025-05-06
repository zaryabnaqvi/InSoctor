import { faker } from '@faker-js/faker';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: string;
  timestamp: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  affectedAssets: string[];
  assignedTo?: string;
  tags: string[];
  eventCount: number;
  firstSeen: Date;
  lastSeen: Date;
  score?: number;
  impactScope?: number;
  attackPhase?: string;
  dataSource?: string;
}

export type AlertFilter = {
  lastUpdated: string;
  created: string;
  alerts: string;
  caseStatus: string;
  dataSource: string;
  searchQuery: string;
};

const alertTitles = [
  "Suspicious PowerShell Execution",
  "Multiple Failed Login Attempts",
  "Unusual Network Traffic Detected",
  "Potential Data Exfiltration",
  "Malware Detection Alert",
  "Privilege Escalation Attempt",
  "DNS Tunneling Activity",
  "Ransomware Behavior Detected",
  "Brute Force Attack",
  "Suspicious Registry Modification",
  "Unauthorized Access Detected",
  "Command and Control Communication",
  "Memory Injection Detected",
  "Potential Lateral Movement",
  "Abnormal User Behavior"
];

const sources = [
  "Endpoint Protection",
  "Network Monitor",
  "SIEM",
  "EDR",
  "Firewall",
  "IDS/IPS",
  "Email Gateway",
  "Cloud Security",
  "User Behavior Analytics",
  "Vulnerability Scanner"
];

const assetTypes = [
  "Workstation-",
  "Server-",
  "Database-",
  "Cloud-Instance-",
  "Mobile-",
  "IoT-Device-",
  "Router-",
  "Switch-",
  "Firewall-",
  "VPN-"
];

const tags = [
  "ransomware",
  "phishing",
  "zero-day",
  "insider-threat",
  "credential-theft",
  "malware",
  "lateral-movement",
  "data-exfiltration",
  "privilege-escalation",
  "reconnaissance"
];

export function generateMockAlerts(count: number): Alert[] {
  return Array.from({ length: count }, () => {
    const severity: AlertSeverity = faker.helpers.arrayElement([
      'critical', 'high', 'medium', 'low', 'info'
    ]);
    
    const status = faker.helpers.arrayElement([
      'open', 'investigating', 'resolved', 'false-positive'
    ]) as 'open' | 'investigating' | 'resolved' | 'false-positive';
    
    const firstSeen = faker.date.recent({ days: 30 });
    const lastSeen = faker.date.between({ 
      from: firstSeen, 
      to: new Date() 
    });
    
    const assetCount = faker.number.int({ min: 1, max: 5 });
    const affectedAssets = Array.from({ length: assetCount }, () => {
      const assetPrefix = faker.helpers.arrayElement(assetTypes);
      return `${assetPrefix}${faker.string.alphanumeric(6).toUpperCase()}`;
    });
    
    const tagCount = faker.number.int({ min: 1, max: 3 });
    const alertTags = faker.helpers.arrayElements(tags, tagCount);
    
    return {
      id: faker.string.uuid(),
      title: faker.helpers.arrayElement(alertTitles),
      description: faker.lorem.sentence({ min: 10, max: 20 }),
      severity,
      source: faker.helpers.arrayElement(sources),
      timestamp: faker.date.recent(),
      status,
      affectedAssets,
      assignedTo: status === 'investigating' ? faker.person.fullName() : undefined,
      tags: alertTags,
      eventCount: faker.number.int({ min: 1, max: 100 }),
      firstSeen,
      lastSeen
    };
  });
}