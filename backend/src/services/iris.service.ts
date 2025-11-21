import axios, { AxiosInstance } from 'axios';
import https from 'https';
import config from '@/config';
import logger from '@/config/logger';
import { IrisCase, Case, CaseFilters } from '@/types';

export class IrisService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.iris.url,
            httpsAgent: new https.Agent({
                rejectUnauthorized: config.iris.verifySSL,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.iris.apiKey}`,
            },
        });
    }

    /**
     * Convert IRIS case to standardized Case format
     */
    private convertCase(irisCase: IrisCase): Case {
        const getSeverity = (severity: string): Case['severity'] => {
            const s = severity.toLowerCase();
            if (s.includes('critical')) return 'critical';
            if (s.includes('high')) return 'high';
            if (s.includes('medium')) return 'medium';
            return 'low';
        };

        const getStatus = (state: string): Case['status'] => {
            const s = state.toLowerCase();
            if (s.includes('closed') || s.includes('resolved')) return 'closed';
            if (s.includes('investigating') || s.includes('progress')) return 'investigating';
            return 'open';
        };

        return {
            id: irisCase.case_id.toString(),
            title: irisCase.case_name,
            description: irisCase.case_description,
            severity: getSeverity(irisCase.case_severity),
            status: getStatus(irisCase.case_state),
            createdAt: irisCase.case_open_date,
            updatedAt: irisCase.case_open_date,
            assignedTo: irisCase.owner,
            alerts: irisCase.alerts || [],
            rawData: irisCase,
        };
    }

    /**
     * Get all cases from IRIS
     */
    async getCases(filters: CaseFilters = {}): Promise<Case[]> {
        try {
            logger.debug('Fetching cases from IRIS', { filters });

            const params: any = {};

            // IRIS API pagination
            if (filters.limit) params.per_page = filters.limit;
            if (filters.offset) params.page = Math.floor(filters.offset / (filters.limit || 10)) + 1;

            const response = await this.client.get('/api/v2/cases', { params });

            let cases: IrisCase[] = response.data.data || [];

            // Apply client-side filters (if IRIS API doesn't support them)
            if (filters.status && filters.status.length > 0) {
                cases = cases.filter(c => {
                    const status = this.convertCase(c).status;
                    return filters.status!.includes(status);
                });
            }

            if (filters.severity && filters.severity.length > 0) {
                cases = cases.filter(c => {
                    const severity = this.convertCase(c).severity;
                    return filters.severity!.includes(severity);
                });
            }

            if (filters.assignedTo) {
                cases = cases.filter(c => c.owner === filters.assignedTo);
            }

            const convertedCases = cases.map(c => this.convertCase(c));

            logger.info(`Fetched ${convertedCases.length} cases from IRIS`);
            return convertedCases;
        } catch (error: any) {
            logger.error('Failed to fetch cases from IRIS', {
                error: error.message,
                response: error.response?.data
            });
            // Return empty array if IRIS is not accessible
            return [];
        }
    }

    /**
     * Get a specific case by ID
     */
    async getCase(caseId: string): Promise<Case | null> {
        try {
            logger.debug(`Fetching case ${caseId} from IRIS`);

            const response = await this.client.get(`/api/v2/cases/${caseId}`);
            const irisCase: IrisCase = response.data.data;

            return this.convertCase(irisCase);
        } catch (error: any) {
            logger.error(`Failed to fetch case ${caseId} from IRIS`, { error: error.message });
            return null;
        }
    }

    /**
     * Create a new case in IRIS
     */
    async createCase(data: {
        name: string;
        description: string;
        severity: string;
        customer?: number;
        classification?: string;
        alertIds?: string[];
    }): Promise<Case> {
        try {
            logger.info('Creating new case in IRIS', { name: data.name });

            const payload = {
                case_name: data.name,
                case_description: data.description,
                case_severity: data.severity,
                case_customer: data.customer || 1, // Default customer
                case_classification: data.classification || 'security-incident',
                case_tags: data.alertIds ? data.alertIds.join(',') : '',
            };

            const response = await this.client.post('/api/v2/cases', payload);
            const irisCase: IrisCase = response.data.data;

            logger.info(`Case created successfully: ${irisCase.case_id}`);
            return this.convertCase(irisCase);
        } catch (error: any) {
            logger.error('Failed to create case in IRIS', {
                error: error.message,
                response: error.response?.data
            });
            throw new Error(`Failed to create case: ${error.message}`);
        }
    }

    /**
     * Update an existing case
     */
    async updateCase(caseId: string, updates: {
        name?: string;
        description?: string;
        severity?: string;
        status?: string;
    }): Promise<Case> {
        try {
            logger.info(`Updating case ${caseId} in IRIS`);

            const payload: any = {};
            if (updates.name) payload.case_name = updates.name;
            if (updates.description) payload.case_description = updates.description;
            if (updates.severity) payload.case_severity = updates.severity;
            if (updates.status) payload.case_state = updates.status;

            const response = await this.client.put(`/api/v2/cases/${caseId}`, payload);
            const irisCase: IrisCase = response.data.data;

            logger.info(`Case ${caseId} updated successfully`);
            return this.convertCase(irisCase);
        } catch (error: any) {
            logger.error(`Failed to update case ${caseId}`, { error: error.message });
            throw new Error(`Failed to update case: ${error.message}`);
        }
    }

    /**
     * Close a case
     */
    async closeCase(caseId: string): Promise<void> {
        try {
            logger.info(`Closing case ${caseId} in IRIS`);

            await this.client.put(`/api/v2/cases/${caseId}`, {
                case_state: 'Closed',
            });

            logger.info(`Case ${caseId} closed successfully`);
        } catch (error: any) {
            logger.error(`Failed to close case ${caseId}`, { error: error.message });
            throw new Error(`Failed to close case: ${error.message}`);
        }
    }

    /**
     * Link an alert to a case
     */
    async linkAlertToCase(alertId: string, caseId: string): Promise<void> {
        try {
            logger.info(`Linking alert ${alertId} to case ${caseId}`);

            // Get current case
            const caseData = await this.getCase(caseId);
            if (!caseData) {
                throw new Error(`Case ${caseId} not found`);
            }

            // Add alert ID to case tags or custom field
            const currentAlerts = caseData.alerts || [];
            if (!currentAlerts.includes(alertId)) {
                currentAlerts.push(alertId);

                await this.client.put(`/api/v2/cases/${caseId}`, {
                    case_tags: currentAlerts.join(','),
                });
            }

            logger.info(`Alert ${alertId} linked to case ${caseId} successfully`);
        } catch (error: any) {
            logger.error(`Failed to link alert ${alertId} to case ${caseId}`, { error: error.message });
            throw new Error(`Failed to link alert to case: ${error.message}`);
        }
    }

    /**
     * Get cases associated with an alert ID
     */
    async getCasesByAlertId(alertId: string): Promise<Case[]> {
        try {
            logger.debug(`Fetching cases for alert ${alertId}`);

            const allCases = await this.getCases();
            const relatedCases = allCases.filter(c => c.alerts.includes(alertId));

            logger.info(`Found ${relatedCases.length} cases for alert ${alertId}`);
            return relatedCases;
        } catch (error: any) {
            logger.error(`Failed to fetch cases for alert ${alertId}`, { error: error.message });
            return [];
        }
    }

    /**
     * Get case statistics
     */
    async getCaseStats(): Promise<any> {
        try {
            const cases = await this.getCases();

            const stats = {
                total: cases.length,
                bySeverity: {
                    critical: cases.filter(c => c.severity === 'critical').length,
                    high: cases.filter(c => c.severity === 'high').length,
                    medium: cases.filter(c => c.severity === 'medium').length,
                    low: cases.filter(c => c.severity === 'low').length,
                },
                byStatus: {
                    open: cases.filter(c => c.status === 'open').length,
                    investigating: cases.filter(c => c.status === 'investigating').length,
                    closed: cases.filter(c => c.status === 'closed').length,
                },
            };

            return stats;
        } catch (error: any) {
            logger.error('Failed to get case statistics', { error: error.message });
            return {
                total: 0,
                bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
                byStatus: { open: 0, investigating: 0, closed: 0 },
            };
        }
    }
}

export default new IrisService();
