import axios from 'axios';
import https from 'https';
import { config } from '../config';

async function testVulnerabilityList() {
    console.log('Testing Vulnerability List Query...\n');

    const client = axios.create({
        baseURL: config.wazuhIndexer.url,
        headers: {
            'Content-Type': 'application/json',
        },
        auth: {
            username: config.wazuhIndexer.username || '',
            password: config.wazuhIndexer.password || '',
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: config.wazuhIndexer.verifySSL,
        }),
    });

    // Test the query that getVulnerabilities uses
    try {
        console.log('=== Test 1: Simple list query ===');
        const query = {
            size: 5,
            query: {
                bool: {
                    must: [{ match_all: {} }]
                }
            },
            sort: [
                { 'vulnerability.detected_at': { order: 'desc' } }
            ]
        };

        console.log('Query:', JSON.stringify(query, null, 2));
        const response = await client.post('/wazuh-states-vulnerabilities-*/_search', query);
        console.log('SUCCESS! Got', response.data.hits.total, 'total hits');
        console.log('First hit fields:', Object.keys(response.data.hits.hits[0]._source));

        // Try to transform one
        const source = response.data.hits.hits[0]._source;
        console.log('\n=== Sample vulnerability data ===');
        console.log('vulnerability.score.base:', source.vulnerability?.score?.base);
        console.log('vulnerability.severity:', source.vulnerability?.severity);
        console.log('vulnerability.reference:', source.vulnerability?.reference);
        console.log('package.name:', source.package?.name);
        console.log('agent.id:', source.agent?.id);

    } catch (error: any) {
        console.error('FAILED:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testVulnerabilityList().catch(console.error);
