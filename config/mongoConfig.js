const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://sachinpitamaasweb:2U8iSnXE8YCrgo5p@cluster0.zj9x2jv.mongodb.net/Pitamaas', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectMongoDB;
