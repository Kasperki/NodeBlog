import * as mongoose from "mongoose";
import * as IUser from "./IUser";

//Create a schema for User
var userSchema = new mongoose.Schema({
    username: { type: String, index: true, unique: true },
    password: String
});

//User model
var User = mongoose.model<IUser.IUserModel>("User", userSchema);
export = User;