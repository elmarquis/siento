import { Employee, EmployeeWithAdditionalInfo, closeDb, dbAll, getDb } from '../dbUtil.ts';

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DB = process.env.DATABASE || 'dev.db';
const ACTIVE_DB = process.env.NODE_ENV === 'production' ? 'prod.db' : DEFAULT_DB;

const dbPath = path.join(__dirname, '..', ACTIVE_DB);

export async function getAllEmployees(): Promise<EmployeeWithAdditionalInfo[]> {
    const db = await getDb(dbPath);
    try {
        const employees = await dbAll<Employee>(
            db,
            `SELECT 
                e.*,
                eai.bio,
                eai.homeSuburb,
                eai.hobbies
            FROM Employee e
            LEFT JOIN EmployeeAdditionalInfo eai ON e.id = eai.id`
        );

        return employees.map(employee => ({
            ...employee,
            additionalInfo: employee.bio ? {
                id: employee.id,
                bio: employee.bio,
                homeSuburb: employee.homeSuburb,
                hobbies: employee.hobbies
            } : undefined
        }));
    } finally {
        await closeDb();
    }
}
