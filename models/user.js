const mongoose = require("mongoose");

const userSchema= new mongoose.Schema({
    firstName:{ type: String, required:true},
    lastName: { type: String, required:true },
    email:{ type: String, required: true, unique:true},
    profilePic:{ type: String, default: "" },
    profilePicId:{type: String, default: ""},
    password:{type: String, required:true},
    role:{
        type: String,
        enum: ["user","admin"],
        default: "user"
    },
    token:{type: String, default:null},
    isVerified:{type: Boolean, default:false},
    isLoggedIn:{type: Boolean, default:false},
    otp:{type: String,default:null },
    otpExpiry:{type: Date, default: null},
    address:{type: String},
    city:{type: String},
   zipcode:{type: String},
    phoneNo:{type: String},

},{timestamps:true})

module.exports = mongoose.model("user",userSchema);
