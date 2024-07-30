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


// Read the client credentials file once at startup
let clientCredentials;
try {
    clientCredentials = JSON.parse(fs.readFileSync('client_credentials.json'));
} catch (err) {
    console.error('Error reading client credentials:', err.message);
}

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
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
        const { clientId, socialAccount,  } = req.body; // Extract clientId and socialAccount from request body

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
            .query(`
                SELECT * FROM IdeaUploader WHERE ClientId = @clientId
                 AND SocialAccount = @socialAccount AND
                  UploadedFileStatus IS NULL
                   AND CreativeStatus = 'Done'
                `);

        if (result.recordset.length > 0) {
            res.json({
                data: result.recordset,
                count: result.recordset.length,
                success: true,
                message: 'Data fetched successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No data found'
            })
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// get the idea uploader data by client id and SocialAccount and post id
const getIdeaUploaderByClientIdAndSocialAccountAndPostId = async (req, res) => {
    try {
        const { clientId, socialAccount, postId } = req.body; // Extract clientId, socialAccount, and postId from request body

        if (!clientId || !socialAccount || !postId) {
            return res.status(400).json({
                success: false,
                message: 'clientId, socialAccount, and postId are required'
            });
        }

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('clientId', sql.Int, clientId)
            .input('socialAccount', sql.VarChar, socialAccount)
            .input('postId', sql.Int, postId)
            .query('SELECT * FROM IdeaUploader WHERE ClientId = @clientId AND SocialAccount = @socialAccount AND Id = @postId');

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

// get the AddMonthlyAmount order by id desc 
const getAddMonthlyAmount = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('orderId', sql.Int, req.params.orderId)
            .query('SELECT * FROM AddMonthlyAmount ORDER BY id DESC');
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


// get the add-vouchar order by id desc 
const getAddVouchar = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('orderId', sql.Int, req.params.orderId)
            .query('SELECT * FROM AddVouchar ORDER BY id DESC');
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

const getClientEnrollmentByClientIdAndSocialAccount = async (req, res) => {
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
            .query('SELECT * FROM ClientEnrollment WHERE ClientId = @clientId AND SocialAccount = @socialAccount');
        res.json({
            data: result.recordset,
            count: result.recordset.length,
            success: true,
            message: 'Data fetched successfully'
        });
    } catch (err) {
        res.status(500).send(err.message);
    }   
}

const getClientData = async (req, res) => {
    try {
        const { clientId, socialAccount } = req.body; // Extract clientId and socialAccount from request body

        if (!clientId || !socialAccount) {
            return res.status(400).json({
                success: false,
                message: 'clientId and socialAccount are required'  
            });
        }

        let pool = await sql.connect(config);

        // Fetch data from ClientEnrollment
        let clientEnrollmentResult = await pool.request()
            .input('clientId', sql.Int, clientId)
            .input('socialAccount', sql.VarChar, socialAccount)
            .query('SELECT * FROM ClientEnrollment WHERE ClientId = @clientId AND SocialAccount = @socialAccount');

        // Fetch data from AddMonthlyAmount
        let addMonthlyAmountResult = await pool.request()
            .input('socialAccount', sql.VarChar, socialAccount)
            .query('SELECT * FROM AddMonthlyAmount WHERE SocialAccount = @socialAccount');

        // Fetch data from AddVouchar
        let addVoucharResult = await pool.request()
            .input('socialAccount', sql.VarChar, socialAccount)
            .query('SELECT * FROM AddVouchar WHERE SocialAccount = @socialAccount');

        // Combine data
        let combinedData = {
            clientEnrollment: clientEnrollmentResult.recordset,
            addMonthlyAmount: addMonthlyAmountResult.recordset,
            addVouchar: addVoucharResult.recordset
        };

        // Calculate total PaidAmount from clientEnrollment, Budget from addMonthlyAmount, and Amount from addVouchar
        let totalPaidAmount = clientEnrollmentResult.recordset.reduce((sum, record) => sum + (record.PaidAmount || 0), 0);
        let totalBudget = addMonthlyAmountResult.recordset.reduce((sum, record) => sum + (record.Budget || 0), 0);
        let totalVoucharAmount = addVoucharResult.recordset.reduce((sum, record) => sum + (record.Amount || 0), 0);

        res.json({
            data: combinedData,
            totals: {
                totalPaidAmount,
                totalBudget,
                totalVoucharAmount
            },
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
    getIdeaUploaderByClientIdAndSocialAccountAndPostId,
    getAddMonthlyAmount,
    getAddVouchar,
    getClientData
};
