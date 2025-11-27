import mongoose from "mongoose";

export async function connectToDatabase(uri: string): Promise<void> {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB database.");
    } catch (error) {
        console.error("Failed to connect to MongoDB database:", error);
        process.exit(1);
    }
}