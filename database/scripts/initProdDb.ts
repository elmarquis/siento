import fetchEmployees from './fetchEmployees.js';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_DB_PATH = path.join(__dirname, '../prod.db');

async function initDb() {

    // Create db file if doesn't exist
    await fs.writeFile(DEV_DB_PATH, '');

    // Create a new database connection
    const db = new sqlite3.Database(DEV_DB_PATH);

    // Convert db.run to promise-based
    const run = (sql: string) => new Promise<void>((resolve, reject) => {
        db.run(sql, (err: Error | null) => {
            if (err) reject(err);
            else resolve();
        });
    });

    console.log('Creating tables if not exist...');

    try {
        // Create Employee table
        await run(`
            CREATE TABLE IF NOT EXISTS Employee (
                id TEXT PRIMARY KEY,
                firstName TEXT,
                lastName TEXT,
                preferredName TEXT,
                title TEXT,
                gender TEXT,
                positionTitle TEXT,
                photoId TEXT,
                firstStartDate TEXT
            )
        `);

        // Create EmployeeAdditionalInfo table
        await run(`
            CREATE TABLE IF NOT EXISTS EmployeeAdditionalInfo (
                id TEXT PRIMARY KEY,
                bio TEXT,
                homeSuburb TEXT,
                hobbies TEXT,
                FOREIGN KEY (id) REFERENCES Employee(id)
            )
        `);

        console.log('Database with tables created successfully');

        // Clear existing data
        await run('DELETE FROM Employee');

        console.log('Fetching latest remote employee data...');

        const employeeData = await fetchEmployees();

        if (!employeeData) {
            throw new Error('Failed to fetch employee data');
        }

        console.log('Employee data fetched successfully');

        console.log('Inserting employee data into prod.db');

        // Insert Employee data
        const employeeStmt = db.prepare(`
            INSERT INTO Employee (id, firstName, lastName, preferredName, title, gender, positionTitle, photoId, firstStartDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const employee of employeeData) {
            await new Promise<void>((resolve, reject) => {
                employeeStmt.run(
                    employee.id,
                    employee.firstName,
                    employee.lastName,
                    employee.preferredName,
                    employee.title,
                    employee.gender,
                    employee.positionTitle,
                    employee.photoId,
                    employee.firstStartDate,
                    (err: Error | null) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        employeeStmt.finalize();


        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        // Close the database connection
        db.close();
    }
}

// Run the initialization
initDb().catch(console.error);
