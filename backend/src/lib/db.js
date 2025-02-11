import mongoose, { mongo } from "mongoose"
export const connectDb = async() =>{
  try{
   await mongoose.connect(process.env.MONGO_URI);
   console.log("connected to database");
  }
  catch(err){
    console.log("database connection error")
  }
}