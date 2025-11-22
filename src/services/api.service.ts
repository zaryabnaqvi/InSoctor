import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: `${API_BASE_URL}/api`,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response) {
                    // Server responded with error
                    console.error('API Error:', error.response.data);
                } else if (error.request) {
                    // Request made but no response
                    console.error('Network Error:', error.message);
                } else {
                    // Something else happened
                    console.error('Error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // Alerts
    async getAlerts(filters?: {
        severity?: string[];
        status?: string[];
        startDate?: string;
        endDate?: string;
        agentId?: string;
        limit?: number;
        offset?: number;
    }) {
        const params = new URLSearchParams();
        if (filters?.severity) params.append('severity', filters.severity.join(','));
        if (filters?.status) params.append('status', filters.status.join(','));
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.agentId) params.append('agentId', filters.agentId);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await this.client.get(`/alerts?${params.toString()}`);
        return response.data;
    }

    async getAlert(id: string) {
        const response = await this.client.get(`/alerts/${id}`);
        return response.data;
    }

    async getAlertStats() {
        const response = await this.client.get('/alerts/stats');
        return response.data;
    }

    async createCaseFromAlert(alertId: string, data: {
        title: string;
        description: string;
        severity?: string;
    }) {
        const response = await this.client.post(`/alerts/${alertId}/case`, data);
        return response.data;
    }

    async updateAlertStatus(alertId: string, status: string) {
        const response = await this.client.put(`/alerts/${alertId}/status`, { status });
        return response.data;
    }

    // Logs
    async getLogs(filters?: {
        startDate?: string;
        endDate?: string;
        agentId?: string;
        agentName?: string;
        decoder?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.agentId) params.append('agentId', filters.agentId);
        if (filters?.agentName) params.append('agentName', filters.agentName);
        if (filters?.decoder) params.append('decoder', filters.decoder);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await this.client.get(`/logs?${params.toString()}`);
        return response.data;
    }

    getLogStreamUrl() {
        return `${API_BASE_URL}/api/logs/stream`;
    }

    // Cases
    async getCases(filters?: {
        status?: string[];
        severity?: string[];
        assignedTo?: string;
        limit?: number;
        offset?: number;
    }) {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status.join(','));
        if (filters?.severity) params.append('severity', filters.severity.join(','));
        if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await this.client.get(`/cases?${params.toString()}`);
        return response.data;
    }

    async getCase(id: string) {
        const response = await this.client.get(`/cases/${id}`);
        return response.data;
    }

    async getCaseStats() {
        const response = await this.client.get('/cases/stats');
        return response.data;
    }

    async createCase(data: {
        name: string;
        description: string;
        severity?: string;
        classification?: string;
        alertIds?: string[];
    }) {
        const response = await this.client.post('/cases', data);
        return response.data;
    }

    async updateCase(id: string, data: {
        name?: string;
        description?: string;
        severity?: string;
        status?: string;
    }) {
        const response = await this.client.put(`/cases/${id}`, data);
        return response.data;
    }

    async closeCase(id: string) {
        const response = await this.client.delete(`/cases/${id}`);
        return response.data;
    }

    async linkAlertToCase(caseId: string, alertId: string) {
        const response = await this.client.post(`/cases/${caseId}/alerts/${alertId}`);
        return response.data;
    }

    // Rules
    async getRules() {
        const response = await this.client.get('/rules');
        return response.data;
    }

    async getRule(id: string) {
        const response = await this.client.get(`/rules/${id}`);
        return response.data;
    }

    async updateRuleStatus(id: string, status: 'enabled' | 'disabled') {
        const response = await this.client.put(`/rules/${id}/status`, { status });
        return response.data;
    }

    // Agents
    async getAgents() {
        const response = await this.client.get('/agents');
        return response.data;
    }

    async getAgent(id: string) {
        const response = await this.client.get(`/agents/${id}`);
        return response.data;
    }

    async restartAgent(id: string) {
        const response = await this.client.post(`/agents/${id}/restart`);
        return response.data;
    }

    async deleteAgent(id: string) {
        const response = await this.client.delete(`/agents/${id}`);
        return response.data;
    }

    // Auth
    async login(credentials: { email: string; password: string }) {
        const response = await this.client.post('/auth/login', credentials);
        return response.data;
    }

    async getMe() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    // Users
    async getUsers() {
        const response = await this.client.get('/users');
        return response.data;
    }

    async createUser(data: any) {
        const response = await this.client.post('/users', data);
        return response.data;
    }

    async updateUser(id: string, data: any) {
        const response = await this.client.put(`/users/${id}`, data);
        return response.data;
    }

    async deleteUser(id: string) {
        const response = await this.client.delete(`/users/${id}`);
        return response.data;
    }

    // ==================== FIM Methods ====================
    /**
     * Get FIM (File Integrity Monitoring) alerts
     */
    async getFimAlerts(filters?: {
        limit?: number;
        startDate?: string;
        endDate?: string;
        action?: string;
        path?: string;
        severity?: string;
    }) {
        const response = await this.client.get('/fim/alerts', { params: filters });
        return response.data;
    }
}

export const apiClient = new ApiClient();
export default apiClient;
