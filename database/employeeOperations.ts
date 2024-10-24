import { EmployeeAdditionalInfo, EmployeeWithAdditionalInfo, dbAll, dbGet, dbRun, getDb } from './dbUtil';

export async function getAllEmployees(): Promise<EmployeeWithAdditionalInfo[]> {
    const db = getDb();
    try {
        const employees = await dbAll<EmployeeWithAdditionalInfo>(
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
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            preferredName: employee.preferredName,
            title: employee.title,
            gender: employee.gender,
            positionTitle: employee.positionTitle,
            photoId: employee.photoId,
            firstStartDate: employee.firstStartDate,
            additionalInfo: employee.bio ? {
                bio: employee.bio,
                homeSuburb: employee.homeSuburb,
                hobbies: employee.hobbies
            } : undefined
        }));
    } finally {
        db.close();
    }
}

export async function updateEmployeeAdditionalInfo(
    employeeId: string,
    info: Omit<EmployeeAdditionalInfo, 'id'>
): Promise<void> {
    const db = getDb();
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
        db.close();
    }
}
