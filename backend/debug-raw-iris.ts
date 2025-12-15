
import axios from 'axios';
import https from 'https';

const IRIS_URL = 'https://20.51.235.43:8443';
const API_KEY = 'OB_2LNjipsfPJaa38M_mFgbFI6puHhYn3nWh6ODMyr33o1CXwaFw2vNW8E-EobZW9NTEwReS9Czn-UCASCPdpg';

async function debugRawIris() {
    try {
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await axios.get(`${IRIS_URL}/manage/cases/list?cid=1`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent
        });

        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
            const firstCase = response.data.data[0];
            console.log('First Case Keys:', Object.keys(firstCase));
            console.log('First Case Data:', JSON.stringify(firstCase, null, 2));
        } else {
            console.log('No cases found or data is not an array');
        }

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

debugRawIris();
