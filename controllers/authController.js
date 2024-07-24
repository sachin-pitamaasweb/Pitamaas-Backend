const { sql } = require('../config/dbConfig');
const OTP = require('../models/otpModel');
const twilio = require('twilio');
require('dotenv').config();

const twilioConfig = require('../config/twilioConfig');

const client = new twilio(twilioConfig.accountSid, twilioConfig.authToken);

const login = async (req, res) => {
    const { phoneNumber } = req.body;
    console.log(req.body);
    try {
        let pool = await sql.connect();
        let result = await pool.request()
            .input('phoneNumber', sql.VarChar, phoneNumber)
            .query('SELECT * FROM clientsRecord WHERE ContactNumber = @phoneNumber');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        client.messages.create({
            body: `Your OTP code is ${otp}`,
            from: twilioConfig.fromNumber,
            to: phoneNumber
        });

        const otpEntry = new OTP({ phoneNumber, otp });
        await otpEntry.save();

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    try {
        const otpRecord = await OTP.findOne({ phoneNumber, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP or phone number' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    login,
    verifyOtp
};
