import * as mongoose from "mongoose";

export interface IBlog
{
    title: string;
    image: string;
    text: string;
    category: string,
    description: string,
    tags: string[],
    date: Date,
    visits: Date[],
}

export interface IBlogModel extends IBlog, mongoose.Document { };