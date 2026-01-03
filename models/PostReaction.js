const mongoose = require('mongoose');

const PostReactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  emoji:  { type: String, enum: ['angry','sad','neutral','happy','love'], required: true },
  updatedAt: { type: Date, default: Date.now }
});

PostReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PostReaction', PostReactionSchema);
