import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { config } from '@/config';
import logger from '@/config/logger';
import { Alert, WazuhLog, AlertFilters, LogFilters } from '@/types';

/**
 * Wazuh Indexer Service
 * Queries alerts and events from Wazuh Indexer (Elasticsearch/OpenSearch)
 */
class WazuhIndexerService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.wazuhIndexer.url,
            headers: {
                'Content-Type': 'application/json',
            },
            auth: {
                username: config.wazuhIndexer.username,
                password: config.wazuhIndexer.password,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: config.wazuhIndexer.verifySSL,
            }),
        });

        logger.info('Wazuh Indexer service initialized', {
            url: config.wazuhIndexer.url,
            verifySSL: config.wazuhIndexer.verifySSL,
        });
    }

    /**
     * Query alerts from Wazuh Indexer
     */
    async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
        try {
            const query = this.buildAlertsQuery(filters);

            logger.debug('Querying Wazuh Indexer for alerts', {
                url: `${config.wazuhIndexer.url}/wazuh-alerts-*/_search`,
                query
            });

            const response = await this.client.post('/wazuh-alerts-*/_search', query);

            const hits = response.data?.hits?.hits || [];
            const alerts: Alert[] = hits.map((hit: any) => this.transformAlert(hit._source));

            logger.info(`Retrieved ${alerts.length} alerts from Wazuh Indexer`);
            return alerts;
        } catch (error: any) {
            logger.error('Failed to query alerts from Wazuh Indexer', {
                error: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                },
            });
            throw new Error(`Wazuh Indexer error: ${error.message}`);
        }
    }

    /**
     * Query logs from Wazuh Indexer
     * Note: This queries the alerts index since wazuh-archives may not be enabled
     * The difference between logs and alerts is in how they're filtered on the frontend
     */
    async getLogs(filters?: LogFilters): Promise<WazuhLog[]> {
        try {
            const query = this.buildLogsQuery(filters);

            logger.debug('Querying Wazuh Indexer for logs', { query });

            const response = await this.client.post('/wazuh-alerts-*/_search', query);

            const hits = response.data?.hits?.hits || [];
            const logs: WazuhLog[] = hits.map((hit: any) => this.transformLog(hit._source));

            logger.info(`Retrieved ${logs.length} logs from Wazuh Indexer`);
            return logs;
        } catch (error: any) {
            logger.error('Failed to query logs from Wazuh Indexer', {
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }

    /**
     * Get alert statistics
     */
    async getAlertStats(): Promise<any> {
        try {
            const query = {
                size: 0,
                aggs: {
                    by_severity: {
                        terms: {
                            field: 'rule.level',
                            size: 20,
                        },
                    },
                    by_rule: {
                        terms: {
                            field: 'rule.id',
                            size: 10,
                        },
                    },
                    by_agent: {
                        terms: {
                            field: 'agent.name',
                            size: 10,
                        },
                    },
                    alert_trend: {
                        date_histogram: {
                            field: 'timestamp',
                            fixed_interval: '1h',
                            min_doc_count: 0,
                            extended_bounds: {
                                min: 'now-24h',
                                max: 'now'
                            }
                        }
                    },
                },
            };

            const response = await this.client.post('/wazuh-alerts-*/_search', query);

            return {
                total: response.data?.hits?.total?.value || 0,
                aggregations: response.data?.aggregations || {},
            };
        } catch (error: any) {
            logger.error('Failed to get alert stats from Wazuh Indexer', {
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Build Elasticsearch query for alerts
     */
    private buildAlertsQuery(filters?: AlertFilters): any {
        const must: any[] = [];

        // Time range filter
        if (filters?.startDate || filters?.endDate) {
            const range: any = {};
            if (filters.startDate) range.gte = filters.startDate;
            if (filters.endDate) range.lte = filters.endDate;

            must.push({
                range: {
                    timestamp: range,
                },
            });
        }

        // Severity filter (based on rule level)
        if (filters?.severity && filters.severity.length > 0) {
            const levels = filters.severity
                .map(s => this.severityToLevel(s))
                .flat(); // Flatten the array of arrays into a single array
            must.push({
                terms: {
                    'rule.level': levels,
                },
            });
        }

        // Agent filter
        if (filters?.agentId) {
            must.push({
                term: {
                    'agent.id': filters.agentId,
                },
            });
        }

        // Rule filter
        if (filters?.ruleId) {
            must.push({
                term: {
                    'rule.id': filters.ruleId,
                },
            });
        }

        return {
            size: filters?.limit || 500,
            from: filters?.offset || 0,
            sort: [{ timestamp: { order: 'desc' } }],
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                },
            },
        };
    }

    /**
     * Build Elasticsearch query for logs
     */
    private buildLogsQuery(filters?: LogFilters): any {
        const must: any[] = [];

        // Time range
        if (filters?.startDate || filters?.endDate) {
            const range: any = {};
            if (filters.startDate) range.gte = filters.startDate;
            if (filters.endDate) range.lte = filters.endDate;

            must.push({
                range: {
                    timestamp: range,
                },
            });
        }

        // Agent filter
        if (filters?.agentId) {
            must.push({
                term: {
                    'agent.id': filters.agentId,
                },
            });
        }

        if (filters?.agentName) {
            must.push({
                match: {
                    'agent.name': filters.agentName,
                },
            });
        }

        // Decoder filter
        if (filters?.decoder) {
            must.push({
                match: {
                    'decoder.name': filters.decoder,
                },
            });
        }

        // Search filter
        if (filters?.search) {
            must.push({
                multi_match: {
                    query: filters.search,
                    fields: ['full_log', 'rule.description', 'data.*'],
                },
            });
        }

        return {
            size: filters?.limit || 100,
            from: filters?.offset || 0,
            sort: [{ timestamp: { order: 'desc' } }],
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                },
            },
        };
    }

    /**
     * Transform Wazuh Indexer alert to our Alert format
     */
    private transformAlert(source: any): Alert {
        const ruleLevel = source.rule?.level || 0;

        return {
            id: source.id || source._id || `${source.timestamp}-${source.rule?.id}`,
            title: source.rule?.description || 'Unknown Alert',
            description: source.full_log || source.rule?.description || '',
            severity: this.levelToSeverity(ruleLevel),
            status: 'open',
            source: source.agent?.name || source.manager?.name || 'Unknown',
            timestamp: source.timestamp || new Date().toISOString(),
            assignedTo: undefined,
            caseId: undefined,
            caseStatus: undefined,
            rawData: source,
        };
    }

    /**
     * Transform Wazuh Indexer log to our WazuhLog format
     */
    private transformLog(source: any): WazuhLog {
        return {
            id: source.id || source._id || `${source.timestamp}`,
            timestamp: source.timestamp || new Date().toISOString(),
            agentId: source.agent?.id || '',
            agentName: source.agent?.name || 'Unknown',
            decoder: source.decoder?.name || '',
            ruleId: source.rule?.id || '',
            ruleDescription: source.rule?.description || '',
            level: source.rule?.level || 0,
            fullLog: source.full_log || '',
            data: source.data || {},
        };
    }

    /**
     * Convert Wazuh rule level to severity
     */
    private levelToSeverity(level: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
        if (level >= 12) return 'critical';
        if (level >= 9) return 'high';
        if (level >= 6) return 'medium';
        if (level >= 3) return 'low';
        return 'info';
    }

    /**
     * Convert severity to Wazuh rule level range
     */
    private severityToLevel(severity: string): number[] {
        switch (severity) {
            case 'critical':
                return [12, 13, 14, 15];
            case 'high':
                return [9, 10, 11];
            case 'medium':
                return [6, 7, 8];
            case 'low':
                return [3, 4, 5];
            case 'info':
                return [0, 1, 2];
            default:
                return [];
        }
    }

    /**
     * Get FIM (File Integrity Monitoring) alerts from Wazuh Indexer
     */
    async getFimAlerts(filters?: any): Promise<any> {
        try {
            const query = this.buildFimQuery(filters);

            logger.debug('Querying Wazuh Indexer for FIM alerts', { query });

            const response = await this.client.post('/wazuh-alerts-*/_search', query);

            const hits = response.data?.hits?.hits || [];
            const fimAlerts = hits.map((hit: any) => this.transformFimAlert(hit._source));

            return {
                alerts: fimAlerts,
                total: response.data?.hits?.total?.value || 0,
                aggregations: response.data?.aggregations || {}
            };
        } catch (error: any) {
            logger.error('Error fetching FIM alerts from Wazuh Indexer', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to fetch FIM alerts: ${error.message}`);
        }
    }

    /**
     * Build Elasticsearch query for FIM alerts
     */
    private buildFimQuery(filters?: any) {
        const limit = filters?.limit || 100;
        const startDate = filters?.startDate || 'now-24h';
        const endDate = filters?.endDate || 'now';

        const must: any[] = [
            {
                match: {
                    'rule.groups': 'syscheck'
                }
            },
            {
                range: {
                    '@timestamp': {
                        gte: startDate,
                        lte: endDate
                    }
                }
            }
        ];

        // Filter by action type (added, modified, deleted)
        if (filters?.action) {
            must.push({
                match: {
                    'syscheck.event': filters.action
                }
            });
        }

        // Filter by file path
        if (filters?.path) {
            must.push({
                wildcard: {
                    'syscheck.path': `*${filters.path}*`
                }
            });
        }

        // Filter by severity/level
        if (filters?.severity) {
            const levels = this.severityToLevel(filters.severity);
            if (levels.length > 0) {
                must.push({
                    terms: {
                        'rule.level': levels
                    }
                });
            }
        }

        return {
            size: limit,
            sort: [
                {
                    '@timestamp': {
                        order: 'desc'
                    }
                }
            ],
            query: {
                bool: {
                    must
                }
            },
            aggs: {
                actions_breakdown: {
                    terms: {
                        field: 'syscheck.event',
                        size: 10
                    }
                },
                top_paths: {
                    terms: {
                        field: 'syscheck.path',
                        size: 10
                    }
                },
                fim_timeline: {
                    date_histogram: {
                        field: '@timestamp',
                        fixed_interval: '1h',
                        extended_bounds: {
                            min: startDate,
                            max: endDate
                        }
                    }
                }
            }
        };
    }

    /**
     * Transform FIM alert from Wazuh Indexer format
     */
    private transformFimAlert(source: any): any {
        return {
            id: source._id || source.id || `${source.agent?.id}-${source.timestamp}`,
            timestamp: source['@timestamp'] || source.timestamp,
            agent: {
                id: source.agent?.id || 'unknown',
                name: source.agent?.name || 'Unknown Agent'
            },
            syscheck: {
                path: source.syscheck?.path || '',
                event: source.syscheck?.event || source.syscheck?.mode || 'unknown',
                size_before: source.syscheck?.size_before,
                size_after: source.syscheck?.size_after,
                perm_before: source.syscheck?.perm_before,
                perm_after: source.syscheck?.perm_after,
                md5_before: source.syscheck?.md5_before,
                md5_after: source.syscheck?.md5_after,
                sha1_before: source.syscheck?.sha1_before,
                sha1_after: source.syscheck?.sha1_after,
                sha256_before: source.syscheck?.sha256_before,
                sha256_after: source.syscheck?.sha256_after,
                uname_before: source.syscheck?.uname_before,
                uname_after: source.syscheck?.uname_after,
                gname_before: source.syscheck?.gname_before,
                gname_after: source.syscheck?.gname_after,
                mtime_before: source.syscheck?.mtime_before,
                mtime_after: source.syscheck?.mtime_after
            },
            rule: {
                id: source.rule?.id || '',
                description: source.rule?.description || '',
                level: source.rule?.level || 0,
                groups: source.rule?.groups || []
            },
            severity: this.levelToSeverity(source.rule?.level || 0)
        };
    }

    /**
     * Get vulnerabilities from Wazuh Indexer
     */
    async getVulnerabilities(filters?: any): Promise<any> {
        try {
            const query = this.buildVulnerabilitiesQuery(filters);

            logger.debug('Querying Wazuh Indexer for vulnerabilities', { query });

            const response = await this.client.post('/wazuh-states-vulnerabilities-*/_search', query);

            const hits = response.data?.hits?.hits || [];
            const vulnerabilities = hits.map((hit: any) => this.transformVulnerability(hit._source));

            logger.info(`Retrieved ${vulnerabilities.length} vulnerabilities from Wazuh Indexer`);

            return {
                vulnerabilities,
                total: response.data?.hits?.total?.value || 0,
                aggregations: response.data?.aggregations || {}
            };
        } catch (error: any) {
            logger.error('Failed to query vulnerabilities from Wazuh Indexer', {
                error: error.message,
                response: error.response?.data,
            });
            throw new Error(`Failed to fetch vulnerabilities: ${error.message}`);
        }
    }

    /**
     * Get vulnerability statistics
     */
    async getVulnerabilityStats(): Promise<any> {
        try {
            const query = {
                size: 0,
                aggs: {
                    by_severity: {
                        terms: {
                            field: 'vulnerability.severity',
                            size: 10
                        }
                    },
                    avg_cvss: {
                        avg: {
                            field: 'vulnerability.score.base'
                        }
                    }
                }
            };

            const response = await this.client.post('/wazuh-states-vulnerabilities-*/_search', query);

            return {
                total: response.data?.hits?.total?.value || 0,
                aggregations: response.data?.aggregations || {}
            };
        } catch (error: any) {
            logger.error('Failed to get vulnerability stats from Wazuh Indexer', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Get vulnerability trends
     */
    async getVulnerabilityTrends(days: number = 30): Promise<any> {
        try {
            const query = {
                size: 0,
                query: {
                    range: {
                        'vulnerability.detected_at': {
                            gte: `now-${days}d/d`,
                            lte: 'now/d'
                        }
                    }
                },
                aggs: {
                    trends: {
                        date_histogram: {
                            field: 'vulnerability.detected_at',
                            calendar_interval: 'day',
                            format: 'yyyy-MM-dd',
                            min_doc_count: 0,
                            extended_bounds: {
                                min: `now-${days}d/d`,
                                max: 'now/d'
                            }
                        },
                        aggs: {
                            by_severity: {
                                terms: {
                                    field: 'vulnerability.severity'
                                }
                            }
                        }
                    }
                }
            };

            const response = await this.client.post('/wazuh-states-vulnerabilities-*/_search', query);

            return {
                trends: response.data?.aggregations?.trends?.buckets || []
            };
        } catch (error: any) {
            logger.error('Failed to get vulnerability trends', {
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get affected packages
     */
    async getAffectedPackages(limit: number = 20): Promise<any> {
        try {
            const query = {
                size: 0,
                aggs: {
                    packages: {
                        terms: {
                            field: 'package.name',
                            size: limit,
                            order: { _count: 'desc' }
                        }
                    }
                }
            };

            const response = await this.client.post('/wazuh-states-vulnerabilities-*/_search', query);

            return {
                packages: response.data?.aggregations?.packages?.buckets || []
            };
        } catch (error: any) {
            logger.error('Failed to get affected packages', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    /**
     * Build Elasticsearch query for vulnerabilities
     */
    private buildVulnerabilitiesQuery(filters?: any): any {
        const must: any[] = [];

        // Severity filter
        if (filters?.severity && filters.severity.length > 0) {
            must.push({
                terms: {
                    'vulnerability.severity': filters.severity.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
                }
            });
        }

        // CVE ID filter
        if (filters?.cve) {
            must.push({
                match: {
                    'vulnerability.reference': filters.cve
                }
            });
        }

        // Package name filter
        if (filters?.package) {
            must.push({
                wildcard: {
                    'package.name': `*${filters.package}*`
                }
            });
        }

        // Agent filter
        if (filters?.agentId) {
            must.push({
                term: {
                    'agent.id': filters.agentId
                }
            });
        }

        // Status filter
        if (filters?.status) {
            must.push({
                term: {
                    'vulnerability.status': filters.status
                }
            });
        }

        // Date range filter
        if (filters?.startDate || filters?.endDate) {
            const range: any = {};
            if (filters.startDate) range.gte = filters.startDate;
            if (filters.endDate) range.lte = filters.endDate;

            must.push({
                range: {
                    'vulnerability.detected_at': range
                }
            });
        }

        return {
            size: filters?.limit || 100,
            from: filters?.offset || 0,
            sort: [
                {
                    'vulnerability.score.base': { order: 'desc', missing: '_last' }
                },
                {
                    'vulnerability.detected_at': { order: 'desc' }
                }
            ],
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }]
                }
            }
        };
    }

    /**
     * Transform vulnerability from Wazuh Indexer format
     */
    private transformVulnerability(source: any): any {
        const cvssScore = source.vulnerability?.score?.base || 0;
        const severity = source.vulnerability?.severity?.toLowerCase() || 'low';

        return {
            id: source._id || `${source.agent?.id}-${source.vulnerability?.reference}`,
            cve: source.vulnerability?.reference || 'N/A',
            title: source.vulnerability?.title || source.vulnerability?.reference || 'Unknown Vulnerability',
            description: source.vulnerability?.description || '',
            severity,
            cvssScore,
            cvss2: null,
            cvss3: { base_score: cvssScore, version: source.vulnerability?.score?.version },
            package: {
                name: source.package?.name || '',
                version: source.package?.version || '',
                architecture: source.package?.architecture || ''
            },
            status: source.vulnerability?.status || 'PENDING',
            detectedAt: source.vulnerability?.detected_at || source['@timestamp'],
            publishedAt: source.vulnerability?.published || '',
            updatedAt: source.vulnerability?.updated || '',
            references: source.vulnerability?.references || [],
            agent: {
                id: source.agent?.id || '',
                name: source.agent?.name || ''
            },
            condition: source.vulnerability?.condition || '',
            external_references: source.vulnerability?.external_references || []
        };
    }
}

export default new WazuhIndexerService();
