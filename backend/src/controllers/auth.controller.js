import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signup = async (req, res) => {
    console.log(req.body);
    const { fullName, email, password } = req.body;
    try {
        if (password.lenght < 6) {
            return res.status(400).json({ message: "password must of atleast length 6" });
        }
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "user alsready exist" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });
        if (newUser) {
            //generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({ message: "Invalid User Data" });
        }
    } catch (err) {
        console.log("error in signup controller");
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) res.status(400).json({ message: "invalid userName or password" });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) res.status(400).json({ message: "invalid userName or password" });
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,    
        });
    }catch(err){
        console.log('error in login controller');
        console.log(err);
    }
}
export const logout = (req, res) => {
    try{
       res.cookie("jwt","",{maxAge:0});
       res.status(200).json({message:"user loggedOut successfully"});
    }catch(err){
        console.log("error in logout controller");
        res.status(500).json({message:"internal server error"});
    }
}
export const updateProfile = async(req, res) => {
    const {profilePic} = req.body;
    try{
        const userId = req.user._id;
        if(!profilePic){
            res.status(401).json({message:"no profile pic provided"});
        }
        const updatedResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:updatedResponse.secure_url},{new:true});    
        res.status(200).json(updatedUser);
    }catch(err){
        console.log("error in updateProfile controller");
        console.log(err);
        res.status(401).json({message:"error in updating the Profile"});
    }
}
export const checkAuth = (req,res)=>{
   try{
    res.status(200).json(req.user);
   }catch(err){
    console.log("error int checkAuth controller");
    res.status(500).json({message:"internal server error"});
   }
}