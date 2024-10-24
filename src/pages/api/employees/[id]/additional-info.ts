import { NextApiRequest, NextApiResponse } from 'next';

import { updateEmployeeAdditionalInfo } from '../../../../../database/controllers/updateEmployee';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        const additionalInfo = req.body;

        await updateEmployeeAdditionalInfo(id as string, additionalInfo);
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error updating additional info:', error);
        res.status(500).json({ message: 'Error updating additional info' });
    }
}
