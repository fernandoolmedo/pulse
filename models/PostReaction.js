//models/PostReaction.js
const mongoose = require('mongoose');

const PostReactionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    index: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  emoji:  {
    type: String,
    enum: ['angry','sad','neutral','happy','love'],
    required: true
  },
  createdAt: {
    type: Date, 
    default: null
  },
  updatedAt: {
    type: Date, 
    default: null
  }
});

PostReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PostReaction', PostReactionSchema);
