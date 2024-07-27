const sql = require('mssql');
const fs = require('fs');
const config = require('../config/dbConfig');

// Function to get all Clients
const getClients = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM  clientsRecord');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
// const getActiveClients = async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query(`
//             SELECT * 
//             FROM clientenrollment 
//             WHERE Status = 'Active' 
//             ORDER BY SocialAccount ASC
//         `);
//         res.json({
//             data: result.recordset,
//             count: result.recordset.length,
//             success: true,
//             message: 'Data fetched successfully'
//         });
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// };

const getActiveClients = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query(`
            SELECT ClientID, SocialAccount 
            FROM clientenrollment 
            WHERE Status = 'Active' 
            ORDER BY SocialAccount ASC
        `);

        const clients = result.recordset;

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active clients found'
            });
        }

        const clientCredentials = clients.map(client => {
            return {
                clientId: client.ClientID,
                socialAccount: client.SocialAccount,
                credentials: generateCredentials(client.ClientID, client.SocialAccount)
            };
        });

        // Save to a JSON file
        fs.writeFileSync('client_credentials.json', JSON.stringify(clientCredentials, null, 2));

        res.json({
            data: clientCredentials,
            count: clientCredentials.length,
            success: true,
            message: 'Data fetched and credentials generated successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const generateCredentials = (clientId, socialAccount) => {
    // Logic to generate credentials
    // This is just a placeholder, you should replace it with actual logic
    return {
        username: `${socialAccount}_${clientId}`,
        password: Math.random().toString(36).substring(2, 15) // Random password generation
    };
};


const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const clientCredentials = JSON.parse(fs.readFileSync('client_credentials.json'));

        const client = clientCredentials.find(c => c.credentials.username === username && c.credentials.password === password);

        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        // const token = jwt.sign(
        //     { clientId: client.clientId, socialAccount: client.socialAccount },
        //     secretKey,
        //     { expiresIn: '1h' }
        // );

        res.json({
            success: true,
            message: 'Login successful',
            // token: token
            clientId: client.clientId,
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};


// function to find the Non-Repeated Clients

const getNonRepeatedClients = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        
        // Query to find non-repeated clients based on clientId
        let result = await pool.request()
            .query(`
                SELECT clientId
                FROM clientsRecord
                GROUP BY clientId
                HAVING COUNT(*) = 1
            `);

        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Function to get duplicate records
const getDuplicateRecords = async (req, res) => {
    try {
        let pool = await sql.connect(config);

        let result = await pool.request().query(`
            SELECT *
            FROM ClientsRecord
            WHERE ContactNumber IN (
                SELECT ContactNumber
                FROM ClientsRecord
                GROUP BY ContactNumber
                HAVING COUNT(*) > 1
            )
        `);

        res.json({
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Function to get unique records
const getUniqueRecords = async (req, res) => {
    try {
        let pool = await sql.connect(config);

        let result = await pool.request().query(`
            SELECT *
            FROM ClientsRecord
            WHERE ContactNumber IN (
                SELECT ContactNumber
                FROM ClientsRecord
                GROUP BY ContactNumber
                HAVING COUNT(*) = 1
            )
        `);

        res.json({
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getPostSchedular = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM  PostSchedular');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getClientEnrollment = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM  ClientEnrollment');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getIdeaUploader = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM  IdeaUploader');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};


// find the idea uploader by client id
const getIdeaUploaderByClientId = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('clientId', sql.Int, req.params.clientId)
            .query('SELECT * FROM IdeaUploader WHERE ClientId = @clientId');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};



// find the Plans
const getPlans = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM  Plans');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// get Panns by PlanId
const getPannsByPlanId = async (req, res) => {
    console.log(req.params.planId);
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('planId', sql.Int, req.params.planId)
            .query('SELECT * FROM Plans WHERE PlanId = @planId');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// get the client Enrollment by client id 
const getClientEnrollmentByClientId = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('clientId', sql.Int, req.params.clientId)
            .query('SELECT * FROM ClientEnrollment WHERE ClientId = @clientId');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// get idea uploader data by client id and SocialAccount
const getIdeaUploaderByClientIdAndSocialAccount = async (req, res) => {
    try {
        const { clientId, socialAccount } = req.body; // Extract clientId and socialAccount from request body

        if (!clientId || !socialAccount) {
            return res.status(400).json({
                success: false,
                message: 'clientId and socialAccount are required'
            });
        }

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('clientId', sql.Int, clientId)
            .input('socialAccount', sql.VarChar, socialAccount)
            .query('SELECT * FROM IdeaUploader WHERE ClientId = @clientId AND SocialAccount = @socialAccount');

        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};


module.exports = {
    getClients,
    login,
    getNonRepeatedClients,
    getActiveClients,
    getDuplicateRecords,
    getUniqueRecords,
    getPostSchedular,
    getClientEnrollment,
    getIdeaUploader,
    getIdeaUploaderByClientId,
    getPlans,
    getPannsByPlanId,
    getClientEnrollmentByClientId,
    getIdeaUploaderByClientIdAndSocialAccount,
    
};
