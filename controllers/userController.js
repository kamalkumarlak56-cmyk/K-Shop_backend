const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyEmail = require("../verifyMail/verifymail");
const otpMail = require("../verifyMail/otpMail");


const dotenv = require("dotenv");
dotenv.config();
const session = require("../models/sessionModel");

const registerUser = async (req, res) => {

    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are equired'
            });
        }
        const isUser = await user.findOne({ email });
        if (isUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = await user.create({
            firstName,
            lastName,
            email,
            password: hashed
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        verifyEmail(token, email);
        newUser.token = token;
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: 'User register successfully',
            user: newUser
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                success: false,
                message: " Authorization token is expired or invalid"
            });
        }

        const token = authHeader.split(" ")[1];
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "token is expired"
                });
            }
            return res.status(400).json({
                success: false,
                message: "token verifiication failed"
            })
        }
        const isUser = await user.findById(decoded.id);
        if (!isUser) {
            return res.status(400).json({
                success: false,
                message: "user is not found"
            })
        }
        isUser.token = null;
        isUser.isVerified = true;
        await isUser.save();
        return res.status(200).json({
            success: true,
            message: "user mail is verified successfully ",
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

const reVerify = async (req, res) => {
    try {
        const { email } = req.body;
        const isUser = await user.findOne({ email });
        if (!isUser) {
            return res.status(400).json({
                success: false,
                message: "user not found "
            })
        }
        const token = jwt.sign({ id: isUser._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        verifyEmail(token, email);
        isUser.token = token;
        isUser.save();
        return res.status(200).json({
            success: true,
            message: "verification email sent again successfully ",
            user: isUser.token
        })
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required '
            });
        }
        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User not exist'
            });
        }

        const verifyPass = await bcrypt.compare(password, existingUser.password);
        if (!verifyPass) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user or password'
            });
        }
        if (existingUser.isVerified === false) {
            return res.status(400).json({
                success: false,
                message: 'Please verify the User then login'
            });
        }

        const accessToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        const refressToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        existingUser.isLoggedIn = true;
        await existingUser.save();

        const existingSession = await session.findOne({ userId: existingUser._id });
        if (existingSession) {
            await session.deleteOne({ userId: existingUser._id });
        }


        session.create({ userId: existingUser._id });
        return res.status(200).json({
            success: true,
            message: `Welcome ${existingUser.firstName}`,
            user: existingUser,
            accessToken,
            refressToken
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

const logout = async (req, res) => {
    try {
        const userId = req.id;
        await session.deleteMany({ userId: userId });
        await user.findByIdAndUpdate(userId, { isLoggedIn: false });
        return res.status(200).json({
            success: true,
            message: "you are logged out"
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

const forgotPass = async (req, res) => {
    try {
        const { email } = req.body;
        const isUser = await user.findOne({ email });
        if (!isUser) {
            return res.status(400).json({
                success: false,
                message: "user not exist"
            });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        isUser.otp = otp;
        isUser.otpExpiry = otpExpiry;
        await isUser.save();

        await otpMail(otp, isUser.email);
        return res.status(200).json({
            success: true,
            message: "otp sent successfully to your mail"
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

const otpVerify = async (req, res) => {
    try {
        const { otp } = req.body;
        const { email } = req.params;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Otp is required."
            });
        }
        const isUser = await user.findOne({ email });
        if (!isUser) {
            return res.status(400).json({
                success: false,
                message: "User not exist, enter valid email."
            });
        }
        if (!isUser.otp || !isUser.otpExpiry) {
            return res.status(400).json({
                success: true,
                message: "otp is not generated."
            });
        }
        if (isUser.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "otp expired, generate new otp"
            });
        }
        if (otp !== isUser.otp) {
            return res.status(400).json({
                success: false,
                message: "otp is invalid"
            });
        }

        isUser.otp = null;
        isUser.otpExpiry = null;
        await isUser.save();
        return res.status(200).json({
            success: true,
            message: "otp verified successfully."
        })


    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

const changePass = async (req, res) => {
    try {
        const { newPass, confirmPass } = req.body;
        const { email } = req.params;
        if (!newPass || !confirmPass) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const isUser = await user.findOne({ email });
        if (!isUser) {
            return res.status(400).json({
                success: false,
                messsage: "user not exist"
            });
        }

        if (newPass !== confirmPass) {
            return res.status(400).json({
                success: false,
                message: "Password not matched"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPass, salt);

        isUser.password = hashed;
        await isUser.save();

        return res.status(200).json({
            success: true,
            message: "password changed successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

const allUsers = async (_, res) => {
    try {
        const Users = await user.find();
        return res.status(200).json({
            success: true,
            Users
        })

    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

const getUserById = async (req, res) => {
    try {
        const userId = req.params;
        const User = await user.find(userId);
        if (!User) {
            return res.status(400).json({
                success: false,
                message: "user not found"
            });
        }
        return res.status(200).json({
            success: true,
            User
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}



module.exports = { registerUser, verify, reVerify, login, logout, forgotPass, otpVerify, changePass, allUsers, getUserById };
