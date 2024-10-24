import { closeDb, getDb } from '../dbUtil.js';

import fetchEmployees from './fetchEmployees.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  // Explicitly specify prod.db path
  const dbPath = path.join(__dirname, '..', 'prod.db');
  const db = await getDb(dbPath);

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
    db.run('DELETE FROM Employee');

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
      employeeStmt.bind([
        employee.id,
        employee.firstName ?? '',
        employee.lastName ?? '',
        employee.preferredName ?? '',
        employee.title ?? '',
        employee.gender ?? '',
        employee.positionTitle ?? '',
        employee.photoId ?? '',
        employee.firstStartDate ?? ''
      ]);
      employeeStmt.step();
      employeeStmt.reset();
    }
    employeeStmt.free();

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
