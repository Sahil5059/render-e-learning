"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 12
require('dotenv').config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); //used for hashing passwords
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //this const "emailRegexPattern" will be used to verfiy if the entered email is a valid email-pattern or not
;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value); //this will test the entered email
            },
            message: "please enter a valid email", //this message will only be displayed if the entered email fails the above test
        },
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 charcters"],
        select: false, //according to my understanding, this will make "password" inaccessable to get from the database by default
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String, //to understand- 1:52:35 to 1:53:31
        }
    ],
}, { timestamps: true });
//now, we will hash the user "password" before it enters the database
//as per my understanding, "isModified()" returns either "true" or "flase" and "next()" basically says: YOU HAVE NO FURTHER BUSINESS HERE, JUMP TO THE NEXT CODE
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
//STEP: 20
//creating sign access token for the user
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
        expiresIn: "5m",
    });
}; //note that the "._id" is the id of the signed-up user stored in the "mongo db" database and my guess is that this "ACCESS_TOKEN" will take the "_id" of the user as a reference.
//creating refresh token for the user
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
        expiresIn: "3d",
    });
};
//watch this to understand the concept of access and refresh tokens- 2:51:30 to 2:54:30
//OVER: 20("m": ../contollers/user.controller.ts)
//now we will compare the password entered by the user with the hashed user password stored in our database
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
//now, we will be exporting our "usermodel" as "User"
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
//now, we will handle user registration
//OVER: 12("c": ../controllers & ../user.controller.ts and "m": ../user.controller.ts)
