import * as mongoose from "mongoose";
import * as IBlog from "./IBlog";

//Create a schema for Blog
var blogSchema = new mongoose.Schema({
    title: { type: String, index: true, unique: true },
    image: String,
    text: String,
    description: String,
    category: String,
    tags: [String],
    date: Date,
    visits: [Date]
});

//Blog model
var Blog = mongoose.model<IBlog.IBlogModel>("Blog", blogSchema, "blog");
export = Blog;