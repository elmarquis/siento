import { closeDb, getDb } from '../dbUtil.js';

import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
    const db = await getDb();
    
    try {
        // Create Employee table
        db.run(`
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
        db.run(`
            CREATE TABLE IF NOT EXISTS EmployeeAdditionalInfo (
                id TEXT PRIMARY KEY,
                bio TEXT,
                homeSuburb TEXT,
                hobbies TEXT,
                FOREIGN KEY (id) REFERENCES Employee(id)
            )
        `);

        // Clear existing data
        db.run('DELETE FROM EmployeeAdditionalInfo');
        db.run('DELETE FROM Employee');

        // Read seed data
        const employeeData = JSON.parse(
            await fs.readFile(path.join(__dirname, '../seedData/employee.json'), 'utf-8')
        );
        const additionalInfoData = JSON.parse(
            await fs.readFile(path.join(__dirname, '../seedData/employeeAdditionalInfo.json'), 'utf-8')
        )[0]; // Note: Data is nested in an extra array

        // Insert Employee data
        const employeeStmt = db.prepare(`
            INSERT INTO Employee (id, firstName, lastName, preferredName, title, gender, positionTitle, photoId, firstStartDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const employee of employeeData) {
            employeeStmt.bind([
                employee.id,
                employee.firstName,
                employee.lastName,
                employee.preferredName,
                employee.title,
                employee.gender,
                employee.positionTitle,
                employee.photoId,
                employee.firstStartDate
            ]);
            employeeStmt.step();
            employeeStmt.reset();
        }
        employeeStmt.free();

        // Insert EmployeeAdditionalInfo data
        const additionalInfoStmt = db.prepare(`
            INSERT INTO EmployeeAdditionalInfo (id, bio, homeSuburb, hobbies)
            VALUES (?, ?, ?, ?)
        `);

        for (const info of additionalInfoData) {
            additionalInfoStmt.bind([
                info.id,
                info.bio,
                info.homeSuburb,
                info.hobbies
            ]);
            additionalInfoStmt.step();
            additionalInfoStmt.reset();
        }
        additionalInfoStmt.free();

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await closeDb();
    }
}

// Run the initialization
initDb().catch(console.error);
