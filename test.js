const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');

async function findPosts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/my_database');
    console.log('MongoDB connected');

    const posts = await BlogPost.find(); // Or .findOne({...}) or .findById(id)
    console.log('Found posts:', posts);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

findPosts();