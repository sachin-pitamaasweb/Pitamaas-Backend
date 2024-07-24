const sql = require('mssql');
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



module.exports = {
    getClients,
    getDuplicateRecords,
    getUniqueRecords,
};
