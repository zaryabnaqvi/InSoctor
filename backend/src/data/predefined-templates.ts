import { PredefinedTemplate } from '../types/report.types';

/**
 * Daily Security Summary Report
 * Overview of security events in the last 24 hours
 */
export const dailySecuritySummary: PredefinedTemplate = {
    id: 'daily-security-summary',
    name: 'Daily Security Summary',
    description: 'Comprehensive overview of security events and alerts from the last 24 hours',
    category: 'security',
    thumbnail: '/templates/daily-security-summary.png',
    template: {
        name: 'Daily Security Summary',
        description: 'Daily overview of security events',
        category: 'security',
        widgets: [
            {
                id: 'total-alerts-kpi',
                type: 'kpi',
                title: 'Total Alerts',
                description: 'Total number of alerts in the last 24 hours',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 0, y: 0, w: 3, h: 2 }
            },
            {
                id: 'critical-alerts-kpi',
                type: 'kpi',
                title: 'Critical Alerts',
                description: 'Critical severity alerts',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [
                        {
                            field: 'severity',
                            operator: 'equals',
                            value: 'critical'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 3, y: 0, w: 3, h: 2 }
            },
            {
                id: 'high-alerts-kpi',
                type: 'kpi',
                title: 'High Alerts',
                description: 'High severity alerts',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [
                        {
                            field: 'severity',
                            operator: 'equals',
                            value: 'high'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 6, y: 0, w: 3, h: 2 }
            },
            {
                id: 'active-agents-kpi',
                type: 'kpi',
                title: 'Active Agents',
                description: 'Number of active agents',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [
                        {
                            field: 'status',
                            operator: 'equals',
                            value: 'active'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 9, y: 0, w: 3, h: 2 }
            },
            {
                id: 'alert-trend-line',
                type: 'line-chart',
                title: 'Alert Trend (Last 7 Days)',
                description: 'Trend of alerts over the past week',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [],
                    groupBy: ['timestamp']
                },
                chartConfig: {
                    xAxis: {
                        field: 'timestamp',
                        label: 'Date'
                    },
                    yAxis: {
                        field: 'count',
                        label: 'Number of Alerts'
                    },
                    series: [
                        {
                            field: 'count',
                            name: 'Alerts',
                            color: '#3b82f6'
                        }
                    ],
                    showLegend: true,
                    showTooltip: true
                },
                position: { x: 0, y: 2, w: 6, h: 4 }
            },
            {
                id: 'severity-distribution-pie',
                type: 'pie-chart',
                title: 'Alerts by Severity',
                description: 'Distribution of alerts by severity level',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [],
                    groupBy: ['severity']
                },
                chartConfig: {
                    colorScheme: ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#6b7280'],
                    showLegend: true,
                    showTooltip: true,
                    showDataLabels: true
                },
                position: { x: 6, y: 2, w: 6, h: 4 }
            },
            {
                id: 'top-rules-bar',
                type: 'bar-chart',
                title: 'Top 10 Triggered Rules',
                description: 'Most frequently triggered rules',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [],
                    groupBy: ['rule.description'],
                    limit: 10
                },
                chartConfig: {
                    xAxis: {
                        field: 'rule.description',
                        label: 'Rule'
                    },
                    yAxis: {
                        field: 'count',
                        label: 'Count'
                    },
                    series: [
                        {
                            field: 'count',
                            name: 'Triggers',
                            color: '#10b981'
                        }
                    ],
                    showTooltip: true
                },
                position: { x: 0, y: 6, w: 12, h: 4 }
            },
            {
                id: 'critical-alerts-table',
                type: 'data-table',
                title: 'Critical Alerts',
                description: 'Detailed view of critical severity alerts',
                dataSource: 'wazuh-alerts',
                queryConfig: {
                    filters: [
                        {
                            field: 'severity',
                            operator: 'in',
                            value: ['critical', 'high']
                        }
                    ],
                    limit: 50
                },
                tableConfig: {
                    columns: [
                        {
                            field: 'timestamp',
                            header: 'Time',
                            sortable: true
                        },
                        {
                            field: 'severity',
                            header: 'Severity',
                            sortable: true,
                            filterable: true
                        },
                        {
                            field: 'title',
                            header: 'Alert',
                            sortable: false
                        },
                        {
                            field: 'source',
                            header: 'Source',
                            sortable: true
                        },
                        {
                            field: 'status',
                            header: 'Status',
                            sortable: true,
                            filterable: true
                        }
                    ],
                    pagination: {
                        enabled: true,
                        pageSize: 10
                    },
                    conditionalFormatting: [
                        {
                            condition: {
                                field: 'severity',
                                operator: 'equals',
                                value: 'critical'
                            },
                            style: {
                                color: '#ef4444',
                                fontWeight: 'bold'
                            }
                        }
                    ]
                },
                position: { x: 0, y: 10, w: 12, h: 5 }
            }
        ],
        globalFilters: [
            {
                field: 'timestamp',
                operator: 'greater-than',
                value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        layout: {
            columns: 12,
            rowHeight: 80
        },
        styling: {
            theme: 'light',
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6'
        },
        isPublic: true,
        isPredefined: true,
        version: 1,
        tags: ['security', 'daily', 'overview']
    }
};

/**
 * Agent Health Dashboard
 * Monitor the health and status of all security agents
 */
export const agentHealthDashboard: PredefinedTemplate = {
    id: 'agent-health-dashboard',
    name: 'Agent Health Dashboard',
    description: 'Real-time monitoring of agent health, connectivity, and performance',
    category: 'operational',
    thumbnail: '/templates/agent-health.png',
    template: {
        name: 'Agent Health Dashboard',
        description: 'Monitor agent status and performance',
        category: 'operational',
        widgets: [
            {
                id: 'total-agents-kpi',
                type: 'kpi',
                title: 'Total Agents',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 0, y: 0, w: 3, h: 2 }
            },
            {
                id: 'active-agents-kpi',
                type: 'kpi',
                title: 'Active Agents',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [
                        {
                            field: 'status',
                            operator: 'equals',
                            value: 'active'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 3, y: 0, w: 3, h: 2 }
            },
            {
                id: 'disconnected-agents-kpi',
                type: 'kpi',
                title: 'Disconnected',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [
                        {
                            field: 'status',
                            operator: 'equals',
                            value: 'disconnected'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 6, y: 0, w: 3, h: 2 }
            },
            {
                id: 'agent-status-pie',
                type: 'pie-chart',
                title: 'Agent Status Distribution',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [],
                    groupBy: ['status']
                },
                chartConfig: {
                    colorScheme: ['#10b981', '#ef4444', '#f97316'],
                    showLegend: true,
                    showTooltip: true
                },
                position: { x: 0, y: 2, w: 6, h: 4 }
            },
            {
                id: 'agent-os-bar',
                type: 'bar-chart',
                title: 'Agents by Operating System',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [],
                    groupBy: ['os.platform']
                },
                chartConfig: {
                    xAxis: {
                        field: 'os.platform',
                        label: 'OS'
                    },
                    yAxis: {
                        field: 'count',
                        label: 'Count'
                    },
                    series: [
                        {
                            field: 'count',
                            name: 'Agents'
                        }
                    ]
                },
                position: { x: 6, y: 2, w: 6, h: 4 }
            },
            {
                id: 'agents-table',
                type: 'data-table',
                title: 'All Agents',
                dataSource: 'wazuh-agents',
                queryConfig: {
                    filters: [],
                    limit: 100
                },
                tableConfig: {
                    columns: [
                        {
                            field: 'name',
                            header: 'Agent Name',
                            sortable: true
                        },
                        {
                            field: 'id',
                            header: 'ID',
                            sortable: true
                        },
                        {
                            field: 'ip',
                            header: 'IP Address',
                            sortable: false
                        },
                        {
                            field: 'os.name',
                            header: 'Operating System',
                            sortable: true
                        },
                        {
                            field: 'status',
                            header: 'Status',
                            sortable: true,
                            filterable: true
                        }
                    ],
                    pagination: {
                        enabled: true,
                        pageSize: 20
                    }
                },
                position: { x: 0, y: 6, w: 12, h: 6 }
            }
        ],
        globalFilters: [],
        layout: {
            columns: 12,
            rowHeight: 80
        },
        isPublic: true,
        isPredefined: true,
        version: 1,
        tags: ['operational', 'agents', 'monitoring']
    }
};

/**
 * Weekly Threat Report
 * Executive summary of threats and incidents over the past week
 */
export const weeklyThreatReport: PredefinedTemplate = {
    id: 'weekly-threat-report',
    name: 'Weekly Threat Report',
    description: 'Executive summary of security threats and incidents from the past week',
    category: 'executive',
    thumbnail: '/templates/weekly-threat.png',
    template: {
        name: 'Weekly Threat Report',
        description: 'Weekly executive threat summary',
        category: 'executive',
        widgets: [
            {
                id: 'total-incidents-kpi',
                type: 'kpi',
                title: 'Total Incidents',
                dataSource: 'iris-cases',
                queryConfig: {
                    filters: [],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 0, y: 0, w: 4, h: 2 }
            },
            {
                id: 'critical-incidents-kpi',
                type: 'kpi',
                title: 'Critical Incidents',
                dataSource: 'iris-cases',
                queryConfig: {
                    filters: [
                        {
                            field: 'severity',
                            operator: 'equals',
                            value: 'critical'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 4, y: 0, w: 4, h: 2 }
            },
            {
                id: 'resolved-incidents-kpi',
                type: 'kpi',
                title: 'Resolved',
                dataSource: 'iris-cases',
                queryConfig: {
                    filters: [
                        {
                            field: 'status',
                            operator: 'equals',
                            value: 'closed'
                        }
                    ],
                    aggregation: {
                        field: 'id',
                        type: 'count'
                    }
                },
                position: { x: 8, y: 0, w: 4, h: 2 }
            },
            {
                id: 'incident-trend',
                type: 'area-chart',
                title: 'Incident Trend',
                dataSource: 'iris-cases',
                queryConfig: {
                    filters: [],
                    groupBy: ['createdAt']
                },
                chartConfig: {
                    xAxis: {
                        field: 'createdAt',
                        label: 'Date'
                    },
                    yAxis: {
                        field: 'count',
                        label: 'Incidents'
                    },
                    series: [
                        {
                            field: 'count',
                            name: 'Incidents',
                            color: '#8b5cf6'
                        }
                    ]
                },
                position: { x: 0, y: 2, w: 12, h: 4 }
            },
            {
                id: 'severity-breakdown',
                type: 'bar-chart',
                title: 'Incidents by Severity',
                dataSource: 'iris-cases',
                queryConfig: {
                    filters: [],
                    groupBy: ['severity']
                },
                position: { x: 0, y: 6, w: 6, h: 4 }
            },
            {
                id: 'status-breakdown',
                type: 'pie-chart',
                title: 'Incidents by Status',
                dataSource: 'iris-cases',
                queryConfig: {
                    filters: [],
                    groupBy: ['status']
                },
                position: { x: 6, y: 6, w: 6, h: 4 }
            }
        ],
        globalFilters: [
            {
                field: 'createdAt',
                operator: 'greater-than',
                value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        layout: {
            columns: 12,
            rowHeight: 80
        },
        isPublic: true,
        isPredefined: true,
        version: 1,
        tags: ['executive', 'weekly', 'threats']
    }
};

export const predefinedTemplates = [
    dailySecuritySummary,
    agentHealthDashboard,
    weeklyThreatReport
];
