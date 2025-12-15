/**
 * IRIS API Connection Test - Simple HTTP Test
 * Tests connectivity to IRIS API using direct HTTP requests
 */

const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config();

const IRIS_URL = process.env.IRIS_API_URL || 'https://20.51.235.43:443';
const IRIS_API_KEY = process.env.IRIS_API_KEY || '';
const IRIS_VERIFY_SSL = process.env.IRIS_VERIFY_SSL === 'true';

console.log('==========================================');
console.log('IRIS API Connection Test');
console.log('==========================================\n');
console.log(`IRIS URL: ${IRIS_URL}`);
console.log(`API Key: ${IRIS_API_KEY ? '***' + IRIS_API_KEY.slice(-4) : 'NOT SET'}`);
console.log(`Verify SSL: ${IRIS_VERIFY_SSL}`);
console.log('\n');

async function testIrisConnection() {
    return new Promise((resolve, reject) => {
        const url = new URL('/api/v2/cases?per_page=5', IRIS_URL);

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${IRIS_API_KEY}`
            },
            rejectUnauthorized: IRIS_VERIFY_SSL
        };

        console.log('Test 1: Fetching cases from IRIS...');
        console.log(`Request URL: ${url.href}`);
        console.log('');

        const protocol = url.protocol === 'https:' ? https : http;

        const req = protocol.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`Response Status: ${res.statusCode}`);
                console.log('');

                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log('✅ SUCCESS: IRIS API is working!');
                        console.log('');

                        if (jsonData.data && Array.isArray(jsonData.data)) {
                            console.log(`Found ${jsonData.data.length} case(s)`);

                            if (jsonData.data.length > 0) {
                                console.log('\nSample case:');
                                console.log(JSON.stringify(jsonData.data[0], null, 2));
                            }
                        } else {
                            console.log('Response:', JSON.stringify(jsonData, null, 2));
                        }

                        resolve(true);
                    } catch (err) {
                        console.log('Raw response:', data);
                        reject(new Error('Failed to parse JSON response'));
                    }
                } else if (res.statusCode === 401) {
                    console.error('❌ FAILED: Authentication failed (401 Unauthorized)');
                    console.error('Please check your IRIS_API_KEY in .env file');
                    reject(new Error('Authentication failed'));
                } else if (res.statusCode === 404) {
                    console.error('❌ FAILED: Endpoint not found (404)');
                    console.error('Please check your IRIS_API_URL in .env file');
                    reject(new Error('Endpoint not found'));
                } else {
                    console.error(`❌ FAILED: HTTP ${res.statusCode}`);
                    console.error('Response:', data);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error('❌ FAILED: Connection error');
            console.error('Error:', err.message);

            if (err.code === 'ECONNREFUSED') {
                console.error('\nIRIS server is not reachable. Please check:');
                console.error('1. IRIS server is running');
                console.error('2. IRIS_API_URL is correct in .env file');
                console.error('3. Network/firewall allows connection');
            } else if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || err.code === 'CERT_HAS_EXPIRED') {
                console.error('\nSSL Certificate issue. Try setting IRIS_VERIFY_SSL=false in .env');
            }

            reject(err);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout after 10 seconds'));
        });

        req.end();
    });
}

// Run the test
testIrisConnection()
    .then(() => {
        console.log('\n==========================================');
        console.log('IRIS API Connection Test Completed');
        console.log('==========================================');
        console.log('\n✅ IRIS API is working correctly!\n');
        process.exit(0);
    })
    .catch((err) => {
        console.log('\n==========================================');
        console.log('IRIS API Connection Test FAILED');
        console.log('==========================================');
        console.log('\nTroubleshooting Tips:');
        console.log('1. Check .env file - ensure IRIS_API_URL and IRIS_API_KEY are correct');
        console.log('2. Verify IRIS server is running and accessible');
        console.log('3. Check network connectivity to IRIS server');
        console.log('4. Verify API key has proper permissions');
        console.log('5. Check if IRIS_VERIFY_SSL setting matches your server setup\n');
        process.exit(1);
    });
