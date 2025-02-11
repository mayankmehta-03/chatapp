import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectedRoute = async(req,res,next)=>{
     try{
      const token = req.cookies.jwt;
      if(!token)res.status(401).json({message:"token not provided"});
      const decoded =  jwt.verify(token,process.env.JWT_SECRET);
      if(!decoded){
        res.status(401).json({message:"unauthorized - invalid token"});
      }
      const user = await User.findById(decoded.userId).select("-password");
      if(!user)res.status(401).json({message:"user not found"});
      req.user = user;
      next();
     }catch(err){
         console.log("error in protected route");
         console.log(err);
     } 
}