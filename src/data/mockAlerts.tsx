// import { Alert } from '@/types/alert';

import { Alert } from "@/lib/alerts-data";

export const mockAlerts: Alert[] = [
  {
    id: 'IC-10542-20250502-00000',
    title: 'C&C detected, which leveraging Application Layer Protocol',
    description: 'Command and Control server detected using Application Layer Protocol for communication',
    severity: 'critical',
    source: 'Standard Endpoint Protection',
    timestamp: new Date('2025-05-06T16:30:15'),
    status: 'open',
    affectedAssets: ['Workstation-001', 'Workstation-002', 'Workstation-003'],
    tags: ['C&C', 'Application Layer', 'Command and Control'],
    eventCount: 12,
    firstSeen: new Date('2025-05-06T16:30:15'),
    lastSeen: new Date('2025-05-06T16:30:15'),
    score: 98,
    impactScope: 3,
    attackPhase: 'Command and Control',
    dataSource: 'Standard Endpoint Protection'
  },
  {
    id: 'IC-10542-20250417-00000',
    title: 'Application Layer Protocol leads to C&C communication',
    description: 'Suspicious application layer protocol traffic detected leading to C&C communication',
    severity: 'high',
    source: 'Standard Endpoint Protection',
    timestamp: new Date('2025-05-01T14:47:51'),
    status: 'investigating',
    affectedAssets: ['Server-005', 'Server-006', 'Server-008'],
    tags: ['C&C', 'Application Layer', 'Suspicious Traffic'],
    eventCount: 21,
    firstSeen: new Date('2025-04-30T22:15:10'),
    lastSeen: new Date('2025-05-01T14:47:51'),
    score: 87,
    impactScope: 3,
    attackPhase: 'Command and Control, Impact',
    dataSource: 'Standard Endpoint Protection'
  },
  {
    id: 'IC-10542-20250409-00000',
    title: 'Repetitive alerts (13)',
    description: 'Multiple similar alerts detected indicating potential scanning or brute force attempts',
    severity: 'medium',
    source: 'Standard Endpoint Protection',
    timestamp: new Date('2025-04-14T17:56:34'),
    status: 'open',
    affectedAssets: [
      'Server-001', 'Server-002', 'Server-003', 'Server-004', 'Server-005',
      'Workstation-001', 'Workstation-002', 'Workstation-003', 'Workstation-004',
      'Workstation-005', 'Workstation-006', 'Workstation-007', 'Workstation-008'
    ],
    tags: ['Repetitive', 'Multiple Alerts', 'Potential Scanning'],
    eventCount: 13,
    firstSeen: new Date('2025-04-14T10:22:45'),
    lastSeen: new Date('2025-04-14T17:56:34'),
    score: 70,
    impactScope: 13,
    attackPhase: 'Impact',
    dataSource: 'Standard Endpoint Protection'
  },
  {
    id: 'WB-10542-20250409-00005',
    title: 'Suspicious Iconcache File Modification',
    description: 'Unauthorized modification of system icon cache files detected',
    severity: 'medium',
    source: 'Endpoint Sensor',
    timestamp: new Date('2025-04-09T15:42:32'),
    status: 'open',
    affectedAssets: ['Workstation-008'],
    tags: ['File Modification', 'Iconcache', 'System Files'],
    eventCount: 1,
    firstSeen: new Date('2025-04-09T15:42:32'),
    lastSeen: new Date('2025-04-09T15:42:32'),
    score: 47,
    impactScope: 1,
    attackPhase: 'Credential Access',
    dataSource: 'Endpoint Sensor'
  },
  {
    id: 'WB-10542-20250409-00003',
    title: 'Suspicious Iconcache File Modification',
    description: 'Unauthorized modification of system icon cache files detected',
    severity: 'medium',
    source: 'Endpoint Sensor',
    timestamp: new Date('2025-04-09T15:37:23'),
    status: 'investigating',
    affectedAssets: ['Workstation-015'],
    tags: ['File Modification', 'Iconcache', 'System Files'],
    eventCount: 1,
    firstSeen: new Date('2025-04-09T15:37:23'),
    lastSeen: new Date('2025-04-09T15:37:23'),
    score: 47,
    impactScope: 1,
    attackPhase: 'Credential Access',
    dataSource: 'Endpoint Sensor'
  },
  {
    id: 'WB-10542-20250409-00002',
    title: 'Suspicious Iconcache File Modification',
    description: 'Unauthorized modification of system icon cache files detected',
    severity: 'medium',
    source: 'Endpoint Sensor',
    timestamp: new Date('2025-04-09T15:42:26'),
    status: 'open',
    affectedAssets: ['Workstation-022'],
    tags: ['File Modification', 'Iconcache', 'System Files'],
    eventCount: 1,
    firstSeen: new Date('2025-04-09T15:42:26'),
    lastSeen: new Date('2025-04-09T15:42:26'),
    score: 46,
    impactScope: 1,
    attackPhase: 'Credential Access',
    dataSource: 'Endpoint Sensor'
  }
];

export const getAlerts = () => {
  return Promise.resolve(mockAlerts);
};

export const filterOptions = {
  lastUpdated: ['All', 'Last 24 hours', 'Last 7 days', 'Last 30 days', 'Custom'],
  created: ['All', 'Last 24 hours', 'Last 7 days', 'Last 30 days', 'Custom'],
  alerts: ['All', 'Critical', 'High', 'Medium', 'Low'],
  caseStatus: ['All', 'Open', 'Investigating', 'Resolved', 'False-positive'],
  dataSource: ['All', 'Standard Endpoint Protection', 'Endpoint Sensor', 'Network Security', 'Email Gateway']
};