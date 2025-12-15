
import irisService from './src/services/iris.service';
import logger from './src/config/logger';

async function debugIris() {
    try {
        console.log('Debugging IRIS Service...');
        console.log('Fetching cases...');
        const cases = await irisService.getCases({ limit: 5 });
        console.log('Cases fetched:', JSON.stringify(cases, null, 2));
    } catch (error: any) {
        console.error('Error fetching cases:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

debugIris();
