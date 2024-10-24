import { NextApiRequest, NextApiResponse } from 'next';

import { updateEmployeeAdditionalInfo } from '../../../../../database/employeeOperations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const { bio, homeSuburb, hobbies } = req.body;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid employee ID' });
    }

    if (!bio || !homeSuburb || !hobbies) {
        return res.status(400).json({ 
            error: 'Missing required fields. Please provide bio, homeSuburb, and hobbies.'
        });
    }

    try {
        await updateEmployeeAdditionalInfo(id, { bio, homeSuburb, hobbies });
        res.status(200).json({ message: 'Employee additional info updated successfully' });
    } catch (error) {
        if (error instanceof Error && error.message === 'Employee not found') {
            return res.status(404).json({ error: 'Employee not found' });
        }
        console.error('Error updating employee additional info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
