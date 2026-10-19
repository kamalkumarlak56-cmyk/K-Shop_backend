const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected Successfully");
    }
    catch (err) {
        console.log("DB connection failed ", err.message);
        process.exit(1);
    }
}

module.exports = connectdb;