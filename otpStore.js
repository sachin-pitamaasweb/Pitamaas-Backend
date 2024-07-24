const fs = require('fs');
const path = require('path');

// File path to store OTP data
const otpFilePath = path.join(__dirname, 'otpData.json');

// Load OTP data from file
const loadOtpData = () => {
    if (fs.existsSync(otpFilePath)) {
        try {
            const data = fs.readFileSync(otpFilePath, 'utf8');
            return data ? JSON.parse(data) : {}; // Handle empty file gracefully
        } catch (error) {
            console.error('Error reading or parsing OTP data file:', error);
            return {}; // Return empty object in case of error
        }
    }
    return {};
};

// Save OTP data to file
const saveOtpData = (data) => {
    fs.writeFileSync(otpFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// Get OTP from JSON file
const getOtp = (email) => {
    const data = loadOtpData();
    // Check if email exists in data
    if (!data[email]) {
        return null;
    }

    return data[email];
};

// Set OTP in JSON file
const setOtp = (email, otp) => {
    const data = loadOtpData();
    data[email] = otp;
    saveOtpData(data);
};

// Delete OTP from JSON file
const deleteOtp = (email) => {
    const data = loadOtpData();
    delete data[email];
    saveOtpData(data);
};

module.exports = { getOtp, setOtp, deleteOtp };
