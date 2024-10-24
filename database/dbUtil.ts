import initSqlJs, { Database, SqlValue } from 'sql.js';

import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default DB path based on environment
const DEFAULT_DB_PATH = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, 'prod.db')
    : path.join(__dirname, 'dev.db');

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    preferredName: string;
    title: string;
    gender: string;
    positionTitle: string;
    photoId: string;
    firstStartDate: string;
    bio: string;
    homeSuburb: string;
    hobbies: string;
}

export interface EmployeeAdditionalInfo {
    id: string;
    bio: string;
    homeSuburb: string;
    hobbies: string;
}

export interface EmployeeWithAdditionalInfo extends Employee {
    additionalInfo?: EmployeeAdditionalInfo;
}

let dbInstance: Database | null = null;
let currentDbPath: string = DEFAULT_DB_PATH;

// Initialize or get database connection
export async function getDb(dbPath?: string): Promise<Database> {
    // If a new dbPath is provided and it's different from the current one,
    // close the existing connection
    if (dbPath && dbPath !== currentDbPath && dbInstance) {
        await closeDb();
    }

    // Update the current dbPath if a new one is provided
    if (dbPath) {
        currentDbPath = dbPath;
    }

    if (dbInstance) return dbInstance;

    const SQL = await initSqlJs();
    
    try {
        // Try to read existing database file
        const data = await fs.readFile(currentDbPath);
        dbInstance = new SQL.Database(new Uint8Array(data));
    } catch {
        // If file doesn't exist or can't be read, create new database
        console.log('Creating new database file');
        dbInstance = new SQL.Database();
        await saveDb(); // Save empty database
    }
    
    return dbInstance;
}

// Save database to file
async function saveDb() {
    if (!dbInstance) return;
    
    try {
        // Ensure directory exists
        const dbDir = path.dirname(currentDbPath);
        await fs.mkdir(dbDir, { recursive: true });
        
        // Export and save database
        const data = dbInstance.export();
        await fs.writeFile(currentDbPath, Buffer.from(data));
    } catch (err) {
        console.error('Error saving database:', err);
        throw new Error(`Failed to save database: ${err instanceof Error ? err.message : String(err)}`);
    }
}

// Execute a query that returns rows
export async function dbAll<T>(database: Database, sql: string, params: SqlValue[] = []): Promise<T[]> {
    const stmt = database.prepare(sql);
    stmt.bind(params);
    
    const rows: T[] = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    await saveDb();
    return rows;
}

// Execute a query that doesn't return rows
export async function dbRun(database: Database, sql: string, params: SqlValue[] = []): Promise<void> {
    const stmt = database.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    await saveDb();
}

// Execute a query that returns a single row
export async function dbGet<T>(database: Database, sql: string, params: SqlValue[] = []): Promise<T | undefined> {
    const stmt = database.prepare(sql);
    stmt.bind(params);
    
    let result: T | undefined;
    if (stmt.step()) {
        result = stmt.getAsObject() as T;
    }
    stmt.free();
    await saveDb();
    return result;
}

// Close database connection and save changes
export async function closeDb(): Promise<void> {
    if (dbInstance) {
        await saveDb();
        dbInstance.close();
        dbInstance = null;
    }
}
