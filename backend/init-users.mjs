import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function initUsers() {
    try {
        // Ensure data directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const users = [{
            id: '1',
            name: 'Security Admin',
            email: 'admin@sentinel-security.com',
            password: hashedPassword,
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Security+Admin&background=0D8ABC&color=fff',
            createdAt: new Date().toISOString()
        }];

        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        console.log('✅ Users file initialized successfully at:', USERS_FILE);
        console.log('Default admin user:');
        console.log('  Email: admin@sentinel-security.com');
        console.log('  Password: admin123');
    } catch (error) {
        console.error('❌ Failed to initialize users:', error);
        process.exit(1);
    }
}

initUsers();
