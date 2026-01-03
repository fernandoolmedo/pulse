// models/BlogPost.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: String,
    body: String,
    //username: String,
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    datePosted: { /* can declare property type with an object like this because we need 'default' */
        type: Date,
        default: new Date() // Automatically sets the date to the current date when a new blog post is created
    },
    reactions: {
    angry:   { type: Number, default: 0 },
    sad:     { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    happy:   { type: Number, default: 0 },
    love:    { type: Number, default: 0 },
    },
    image: String // Store the filename of the uploaded image
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

module.exports = BlogPost;