import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {

        if(!fullName || !email || !password){
            console.log('Field kahan h');            
            return res.status(400).json({ message: "All fields are required" });
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters"});
            //400 stands for error message
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message: "Email already exists"});

        //hash passwords using bcryptjs package
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,// equivalent to fullName: fullName
            email,
            password: hashedPassword,
        })

        if(newUser){
            //generate jsonwebtoken(jwt) here
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
            //201 means something is being created

        }else{
            res.status(400).json({message: "Invalid user data"})
        }
        
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"})
        //500 means something is broken in our part or server error
        
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        generateToken(user._id,res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.log('Error in login Controller', error.message);
        res.status(500).json({ message: "Internal server error" })
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged Out Successfully"})
    } catch (error) {
        console.log('Error in logout Controller', error.message);
        res.status(500).json({ message: "Internal server error" })
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id; // We can access the user's Id as this function is protected and we had added the user into the request using 'req.user = user'

        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic: uploadResponse.secure_url},{new: true});

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log('Error in update profile controller',error);
        res.status(500).json({message:"Internal Server Error"})
        
    }
};

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log('Error in checkAuth controller', error.message);
        res.status(500).json({message:"Internal Server Error"})
        
    }
}; 