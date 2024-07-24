
const nodemailer = require('nodemailer');
const sql = require('mssql');
const config = require('../config/dbConfig');
const { setOtp, getOtp, deleteOtp } = require('../otpStore');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: 'sachingautam6239@gmail.com', // Your email address
        pass: 'nxajuvwkblihqind'   // Your email password
    }
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};


const login = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM clientsRecord WHERE email = @email');
        
        if (result.recordset.length > 0) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Send OTP via email
            await sendOtpEmail(email, otp);

            // Store OTP in in-memory store with expiration logic if needed
            setOtp(email, otp);

            res.json({ success: true, message: 'OTP sent successfully' });
        } else {
            res.status(404).send('Email not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};


const verifyOtp = async (req, res) => {
    const { email, code } = req.body;
    if(!email || !code) {
        return res.status(400).json({ success: false, message: 'Email and code are required' });
    }
    const storedOtp = await getOtp(email);
    if (storedOtp && storedOtp === code) {
        await deleteOtp(email); // Remove OTP after successful verification
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
};

module.exports = {
    login,
    verifyOtp
};