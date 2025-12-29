import mongoose from "mongoose";
import { env } from "./env.js";
type ConnectionObject ={
  isConnected?: number;
}

const connection:ConnectionObject={};

async function dbConnect():Promise<void>{
  if(connection.isConnected){
    console.log("Already connected to MongoDB");
    return;

  } 
  try{
    const db = await mongoose.connect(env.MONGO_URI || "",{});
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected successfully");
  } catch(error){
    console.log("Database connection error",error);
    process.exit(1);
  }
}

export default dbConnect;
