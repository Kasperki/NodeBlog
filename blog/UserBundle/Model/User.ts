import * as mongoose from "mongoose";
import * as IUser from "./IUser";

//Create a schema for User
let userSchema = new mongoose.Schema({
    username: { type: String, index: true, unique: true },
    password: String
});

//User model
let User = mongoose.model<IUser.IUserModel>("User", userSchema, "user");
export = User;