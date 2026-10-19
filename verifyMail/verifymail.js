const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const verifyEmail = (token, mail) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: mail,
        subject: 'Email Verification',
        text: `Hi! There, You have recently visited 
           our website and entered your email.
           Please follow the given link to verify your email
           http://localhost:5173/verify/${token} 
           Thanks`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log("error in sending email", err.message)
        } else {
            console.log("email send successfully");
            console.log(info);
        }

    })

}


module.exports = verifyEmail;
