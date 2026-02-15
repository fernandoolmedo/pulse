const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
  title: String,
  body: String,

  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  datePosted: {
    type: Date,
    default: Date.now // ✅ better than new Date() (see note below)
  },

  reactions: {
    angry:   { type: Number, default: 0 },
    sad:     { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    happy:   { type: Number, default: 0 },
    love:    { type: Number, default: 0 },
  },

  // Legacy/local path (old posts may still reference /img/...)
  image: { type: String, default: null },

  // ✅ New S3/CloudFront fields
  imageKey: { type: String, default: null }, // ex: posts/<userid>/12345-abcd.jpg
  imageUrl: { type: String, default: null }  // ex: https://c8tobcu35nzp8.cloudfront.net/posts/...
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
module.exports = BlogPost;
