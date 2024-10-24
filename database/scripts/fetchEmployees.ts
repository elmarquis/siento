
interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  preferredName?: string
  title: string
  gender: string
  positionTitle: string
  photoId?: string
}

interface EmployeeAdditional {
  firstStartDate: string
}

export default async function fetchEmployees() {

  try {
    // Fetch all employees
    const response = await fetch('https://api.example.com/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const employees: EmployeeBasic[] = await response.json();

    // Fetch additional data for each employee
    const completeEmployees = await Promise.all(
      employees.map(async (employee: EmployeeBasic) => {
        const additionalResponse = await fetch(`https://api.example.com/employee/${employee.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!additionalResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const additionalData: EmployeeAdditional = await additionalResponse.json();
        return {
          ...employee,
          firstStartDate: additionalData.firstStartDate,
        }
      })
    )

    return completeEmployees;
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}