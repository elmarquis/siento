import { fileURLToPath } from 'url';
import path from 'path';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.NODE_ENV === 'production' 
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

// Get database connection
export function getDb(): sqlite3.Database {
    return new sqlite3.Database(DB_PATH);
}

// Convert db.all to promise-based
export function dbAll<T>(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });
}

// Convert db.run to promise-based
export function dbRun(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Convert db.get to promise-based
export function dbGet<T>(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T | undefined);
        });
    });
}
