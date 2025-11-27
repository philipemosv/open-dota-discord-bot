import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    discordId: string;
    steamId: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    discordId: { type: String, required: true, unique: true },
    steamId: { type: String, required: true },
    username: { type: String, required: true }
}, { timestamps: true });

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;