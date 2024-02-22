//STEP: 12
require('dotenv').config();
import mongoose,{Document,Model,Schema} from "mongoose";
import bcrypt from "bcryptjs"; //used for hashing passwords
import jwt from 'jsonwebtoken';
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //this const "emailRegexPattern" will be used to verfiy if the entered email is a valid email-pattern or not
//now, we will be using "interface" beacuse we are coding with typescript
export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    avatar:{
        public_id: string; //since we are using "cloudinary", we will have a "public_id"
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{courseId: string}>; //for the courses that the user has purshased
    comparePassword: (password: string) => Promise<boolean>;

    //STEP: 19
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
    //OVER: 19
};
const userSchema: Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please enter your name"],
    },
    email:{
        type:String,
        required: [true, "Please enter your email"], //now, we will validate the entered email
        validate: {
            validator: function (value:string){
                return emailRegexPattern.test(value); //this will test the entered email
            },
            message:"please enter a valid email", //this message will only be displayed if the entered email fails the above test
        },
        unique:true,
    },
    password:{
        type:String, //note that we cannot set password as "required" because then, we will not be able to use "social-authentication" as it does not require password.
        minlength: [6, "Password must be at least 6 charcters"],
        select: false, //according to my understanding, this will make "password" inaccessable to get from the database by default
    },
    avatar:{
        public_id: String,
        url: String,
    },
    role:{
        type: String,
        default: "user",
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    courses:[
        {
            courseId: String, //to understand- 1:52:35 to 1:53:31
        }
    ],
},{timestamps:true});
//now, we will hash the user "password" before it enters the database
//as per my understanding, "isModified()" returns either "true" or "flase" and "next()" basically says: YOU HAVE NO FURTHER BUSINESS HERE, JUMP TO THE NEXT CODE
userSchema.pre<IUser>('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//STEP: 20
//creating sign access token for the user
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN || '', {
        expiresIn: "5m",
    });
}; //note that the "._id" is the id of the signed-up user stored in the "mongo db" database and my guess is that this "ACCESS_TOKEN" will take the "_id" of the user as a reference.
//creating refresh token for the user
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN || '', {
        expiresIn: "3d",
    });
};
//watch this to understand the concept of access and refresh tokens- 2:51:30 to 2:54:30
//OVER: 20("m": ../contollers/user.controller.ts)

//now we will compare the password entered by the user with the hashed user password stored in our database
userSchema.methods.comparePassword = async function(enteredPassword:string): Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password);
};
//now, we will be exporting our "usermodel" as "User"
const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;
//now, we will handle user registration
//OVER: 12("c": ../controllers & ../user.controller.ts and "m": ../user.controller.ts)