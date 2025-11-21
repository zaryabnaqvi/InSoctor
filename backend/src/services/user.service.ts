import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../types';
import logger from '../config/logger';

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

class UserService {
    private users: User[] = [];
    private initialized = false;

    constructor() {
        this.init();
    }

    private async init() {
        try {
            // Ensure data directory exists
            try {
                await fs.access(DATA_DIR);
            } catch {
                await fs.mkdir(DATA_DIR, { recursive: true });
            }

            // Try to load users
            try {
                const data = await fs.readFile(USERS_FILE, 'utf-8');
                this.users = JSON.parse(data);
            } catch (error) {
                // File doesn't exist or is invalid, create default admin
                logger.info('Initializing users file with default admin');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                this.users = [{
                    id: '1',
                    name: 'Security Admin',
                    email: 'admin@sentinel-security.com',
                    password: hashedPassword,
                    role: 'admin',
                    avatar: 'https://ui-avatars.com/api/?name=Security+Admin&background=0D8ABC&color=fff',
                    createdAt: new Date().toISOString()
                }];
                await this.saveUsers();
            }
            this.initialized = true;
        } catch (error) {
            logger.error('Failed to initialize UserService:', error);
        }
    }

    private async saveUsers() {
        await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
    }

    private async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }

    async getAll(): Promise<User[]> {
        await this.ensureInitialized();
        // Return users without passwords
        return this.users.map(({ password, ...user }) => user as User);
    }

    async findByEmail(email: string): Promise<User | undefined> {
        await this.ensureInitialized();
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    async findById(id: string): Promise<User | undefined> {
        await this.ensureInitialized();
        const user = this.users.find(u => u.id === id);
        if (!user) return undefined;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }

    async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        await this.ensureInitialized();

        if (await this.findByEmail(userData.email)) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 10);

        const newUser: User = {
            ...userData,
            id: uuidv4(),
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
        };

        this.users.push(newUser);
        await this.saveUsers();

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
    }

    async update(id: string, updates: Partial<User>): Promise<User> {
        await this.ensureInitialized();

        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error('User not found');
        }

        // If updating password, hash it
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        // Prevent email duplication if email is changed
        if (updates.email && updates.email !== this.users[index].email) {
            if (await this.findByEmail(updates.email)) {
                throw new Error('Email already in use');
            }
        }

        this.users[index] = { ...this.users[index], ...updates };
        await this.saveUsers();

        const { password, ...userWithoutPassword } = this.users[index];
        return userWithoutPassword as User;
    }

    async delete(id: string): Promise<boolean> {
        await this.ensureInitialized();

        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.id !== id);

        if (this.users.length !== initialLength) {
            await this.saveUsers();
            return true;
        }
        return false;
    }

    async validatePassword(user: User, password: string): Promise<boolean> {
        if (!user.password) return false;
        return bcrypt.compare(password, user.password);
    }
}

export default new UserService();
