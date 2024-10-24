This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

Install node modules

`npm install`

Setup dev db

`npm run init-dev-db`

Run the development server:

`npm run dev`

## Database

`npm run init-dev-db` creates and populates `dev.db` with seedData from database/seedData directory
`npm run init-prod-db` creates and populates `prod.db` by retrieving real GC Hub member data from the westpac APIs. (Does not populate or amend data in the employeeAddionalInfo table)

Install the VsCode plugin SQLite Viewer to view the .db files.

There are 2 tables:

### Employee

Read only. Stores data fetched from the westpac APIs.

### EmployeeAdditionalInfo

Editable by users. Stores the additional fields we let the user add via the application.

## API Endpoints

### GET /api/employees

Fetches a list of all employees, with additionalInformation data.

**Response:**

```json
[
  {
    "id": "M00001",
    "firstName": "John",
    "lastName": "Doe",
    "preferredName": "Johnny",
    "title": "Mr",
    "gender": "Male",
    "positionTitle": "Software Engineer",
    "photoId": "john_doe.jpg",
    "firstStartDate": "2020-01-15",
    "additionalInfo": {
      "bio": "Passionate about coding and new technologies. Enjoys hiking and reading sci-fi novels.",
      "homeSuburb": "Mudgeeraba",
      "hobbies": "Hiking, reading sci-fi novels"
    }
  },
  ...
]
```

### PUT /api/employee/{id}

**body:**

```json
{
  "bio": "string",
  "homeSuburb": "string",
  "hobbies": "string",
}
```

Upserts additional information data for a given employee

**Response:**

```json
{ 
  "message": "Success" 
}
```
