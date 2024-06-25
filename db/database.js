import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

const connectToMongo = async () => {
    try {
        mongoose.connect(`${MONGO_URI}`)
        console.log("Database is connected");
    } catch (error) {
        console.log(error);
        console.log("Database is not connected");
    }
}

export default connectToMongo;
