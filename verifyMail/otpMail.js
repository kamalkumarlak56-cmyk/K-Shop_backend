const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const otpMail = async (otp, email) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOption = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Otp Verification for forgot password",
        html: `<p> your otp is <b>${otp}</b> , <br>please verify your otp and reset your password. </p>`
    }

    transporter.sendMail(mailOption, (err, info) => {
        if (err) {
            console.log("error in sending mail", err.message);
        } else {
            console.log("otp sent successfully");
            console.log(info);
        }
    })
}


module.exports = otpMail ; 

