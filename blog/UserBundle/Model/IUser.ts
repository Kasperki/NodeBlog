import * as mongoose from "mongoose";

export interface IUser
{
    username: string;
    password: string;
}

export interface IUserModel extends IUser, mongoose.Document { };

