//models/BlogPost.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema(
{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    body: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    category: {
      type: String,
      enum: [
        'technology',
        'lifestyle',
        'gaming',
        'music',
        'sports',
        'science',
        'other'
      ],
      default: 'other',
      index: true
    },

    tags: {
      type: [String],
      default: []
    },

    reactions: {
      angry:   { type: Number, default: 0, min: 0 },
      sad:     { type: Number, default: 0, min: 0 },
      neutral: { type: Number, default: 0, min: 0 },
      happy:   { type: Number, default: 0, min: 0 },
      love:    { type: Number, default: 0, min: 0 },
    },

    // Legacy/local path (old posts may still reference /img/...)
    image: { type: String, default: null },

    imageKey: { type: String, default: null },
    imageUrl: { type: String, default: null }  
},

{
  timestamps: true 
}
);

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
module.exports = BlogPost;
