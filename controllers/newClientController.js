const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('../config/dbConfig');


// const getClients = async (req, res) => {
//     try {
//         let pool = await sql.connect(config);
//         let result = await pool.request().query('SELECT * FROM  clientsRecord');
//         res.json(result.recordset);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// };

const getSocialClientInfo = async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query(`SELECT * FROM socialclientinfo`);
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

// async function listTableColumns(tableName) {
//     try {
//         // Connect to the database
//         let pool = await sql.connect(config);

//         // Query to list columns for a specific table
//         let result = await pool.request().query(`
//             SELECT COLUMN_NAME
//             FROM INFORMATION_SCHEMA.COLUMNS
//             WHERE TABLE_NAME = '${tableName}'
//             ORDER BY ORDINAL_POSITION;
//         `);

//         // Output the results
//         console.log(`Columns for table '${tableName}':`);
//         result.recordset.forEach(row => {
//             console.log(row.COLUMN_NAME);
//         });

//         // Close the database connection
//         await pool.close();
//     } catch (err) {
//         console.error('SQL error', err);
//     }
// }

// // Call the function for table 'socialclientinfo'
// listTableColumns('socialclientinfo');

const generateUniqueID = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    return `${timestamp}${randomNum}`;
};

const getClientInfo = async (req, res) => {
    try {
        let pool = await sql.connect(config);

        // Fetch data from clientsRecord table
        // let result1 = await pool.request().query('SELECT ClientID, ClientName, ContactNumber, LicID, DOB, Address, Status, State, City, Company, PAN, Accountno, ActHolder, Email, TinNo, IFSC, Bankname, BankBranch, dated, Country, StateCode, RouteID, AddedBy FROM clientsRecord');
        let result1 = await pool.request().query(`
            SELECT ClientID, ClientName, ContactNumber, LicID, DOB, Address, Status, State, City, Company, PAN, Accountno, ActHolder, Email, TinNo, IFSC, Bankname, BankBranch, dated, Country, StateCode, RouteID, AddedBy 
            FROM clientsRecord
            WHERE ClientID = 2705
            ORDER BY ClientID
        `);
        // Fetch SocialAccount from ClientEnrollment table
        let socialAccounts = await pool.request().query(`
            SELECT SocialAccount, ClientID FROM ClientEnrollment  WHERE Status = 'Active' AND ClientID = 2705 ORDER BY SocialAccount ASC `);
        // console.log(socialAccounts.recordset);
        // Convert result1 and socialAccounts into a more usable format
        const socialAccountMap = {};
        socialAccounts.recordset.forEach(account => {
            socialAccountMap[account.SocialAccount] = account.SocialAccount;
        });
        // console.log('socialAccountMap', socialAccountMap);

        const clientInfo = result1.recordset.map(client => ({
            id: client.ClientID, // Use ClientID as the unique id
            uniqueid: generateUniqueID(),
            SocialAccount: socialAccountMap || null,
            ClientName: client.ClientName,
            status: client.Status,
            DOB: client.DOB,
            Address: client.Address,
            Mobile: client.ContactNumber,
            GST: client.TinNo,
            Email: client.Email,
            CreatedDate: client.dated,
            CreatedBy: client.AddedBy
        }));


        const clientInfo2 = socialAccounts.recordset.map(account => {
            return {
                ClientID: account.ClientID,
                SocialAccount: account.SocialAccount
            };
        });

        console.log('clientInfo2', clientInfo2);

        // Create a dictionary where each ClientID maps to an array of SocialAccounts
        // const clientInfo2Dict = clientInfo2.reduce((acc, info) => {
        //     if (!acc[info.ClientID]) {
        //         acc[info.ClientID] = [];
        //     }
        //     acc[info.ClientID].push({ SocialAccount: info.SocialAccount });
        //     return acc;
        // }, {});

        // // Filter and add SocialAccounts array to clientInfo3
        // const clientInfo3 = result1.recordset
        //     .filter(client => clientInfo2Dict.hasOwnProperty(client.ClientID))
        //     .map(client => ({
        //         ...client,
        //         uniqueid: generateUniqueID(),
        //         SocialAccounts: clientInfo2Dict[client.ClientID]
        //     }));

        // console.log('clientInfo3', clientInfo3);

        // Create a dictionary where each SocialAccount maps to the client information
        const clientInfoDict = result1.recordset.reduce((acc, client) => {
            acc[client.ClientID] = client;
            return acc;
        }, {});

        // Create the combined result based on SocialAccount
        const clientInfo3 = socialAccounts.recordset.map(account => {
            return {
                ...clientInfoDict[account.ClientID],
                uniqueid: generateUniqueID(),
                SocialAccount: [{ SocialAccount: account.SocialAccount }]
            };
        });

        console.log('clientInfo3', clientInfo3);


        fs.writeFile('clientInfo2705.json', JSON.stringify(clientInfo3, null, 2), (err) => {
            if (err) throw err;
            res.send({
                message: 'Data written to clientInfo.json successfully',
                success: true,
                data: clientInfo3
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};


module.exports = { getSocialClientInfo, getClientInfo };