import mongoose from "mongoose";

const mongoUri= process.env.MONGODB_URI;

export async function connectToMongoDB(){
    try{
        if(mongoose.connection.readyState === 1){
            return mongoose.connection;
        }

        await mongoose.connect(mongoUri as string);
        return mongoose.connection
    }catch(error){
        console.log("MongoDB error", error)
    }
}