//models/BlogPost.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CATEGORIES = [
  'food-drink',
  'tech',
  'style-beauty',
  'entertainment',
  'sports',
  'travel',
  'culture',
  'pets',
  'other'
];

// Display names for the create form. Keyed by the stored slug so the database
// never holds presentation strings.
const CATEGORY_LABELS = {
  'food-drink':    'Food & Drink',
  'tech':          'Tech',
  'style-beauty':  'Style & Beauty',
  'entertainment': 'Entertainment',
  'sports':        'Sports',
  'travel':        'Travel',
  'culture':       'Culture',
  'pets':          'Pets',
  'other':         'Other'
};

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 24;

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

    // Locked taxonomy (2026-07-27): 9 broad buckets, with `tags` carrying the
    // granularity. Splitting a bucket later is cheap; merging is not.
    // Safe to change in place — nothing wrote `category` before this, so every
    // existing post is 'other' or has no value at all. No migration required.
    category: {
      type: String,
      enum: CATEGORIES,
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

BlogPost.CATEGORIES = CATEGORIES;
BlogPost.CATEGORY_LABELS = CATEGORY_LABELS;
BlogPost.MAX_TAGS = MAX_TAGS;
BlogPost.MAX_TAG_LENGTH = MAX_TAG_LENGTH;

module.exports = BlogPost;
