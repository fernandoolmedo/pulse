// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // hide by default
  },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);
