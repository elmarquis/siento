import { EmployeeAdditionalInfo, closeDb, dbGet, dbRun, getDb } from '../dbUtil.js';

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DB = process.env.DATABASE || 'dev.db';
const ACTIVE_DB = process.env.NODE_ENV === 'production' ? 'prod.db' : DEFAULT_DB;

const dbPath = path.join(__dirname, '..', ACTIVE_DB);

export async function updateEmployeeAdditionalInfo(
    employeeId: string,
    info: Omit<EmployeeAdditionalInfo, 'id'>
): Promise<void> {
  
    const db = await getDb(dbPath);
    try {
        // First check if the employee exists
        const employee = await dbGet<{ id: string }>(
            db,
            'SELECT id FROM Employee WHERE id = ?',
            [employeeId]
        );

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Check if additional info exists
        const existingInfo = await dbGet<{ id: string }>(
            db,
            'SELECT id FROM EmployeeAdditionalInfo WHERE id = ?',
            [employeeId]
        );

        if (existingInfo) {
            // Update existing record
            await dbRun(
                db,
                `UPDATE EmployeeAdditionalInfo 
                SET bio = ?, homeSuburb = ?, hobbies = ?
                WHERE id = ?`,
                [info.bio, info.homeSuburb, info.hobbies, employeeId]
            );
        } else {
            // Insert new record
            await dbRun(
                db,
                `INSERT INTO EmployeeAdditionalInfo (id, bio, homeSuburb, hobbies)
                VALUES (?, ?, ?, ?)`,
                [employeeId, info.bio, info.homeSuburb, info.hobbies]
            );
        }
    } finally {
        await closeDb();
    }
}
