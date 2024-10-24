import { Employee, EmployeeWithAdditionalInfo, closeDb, dbAll, getDb } from '../dbUtil.ts';

export async function getAllEmployees(): Promise<EmployeeWithAdditionalInfo[]> {
    const db = await getDb();
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
