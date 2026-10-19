const user = require("../models/user");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({
                success: false,
                message: "Authorization token is missing or invalid"
            });
        }
        const token = authHeader.split(" ")[1];
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({
                    success: false,
                    message: "Authorization token is expired"
                });
            }
            return res.status(400).json({
                success: false,
                message: "Authorization token is invalid"
            })
        }

        const isUser = await user.findById(decoded.id);
        if (!isUser) {
            return res.status(400).json({
                success: false,
                message: "User not exist"
            });
        }

        req.user = isUser;
        req.id = isUser._id;
        next();


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "this field is only for Admin"
            })
        }
        next();

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = { isAuthenticated, isAdmin };
