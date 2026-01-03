// controllers/newPost.js
module.exports = (req, res) => {
  if (req.session.userId) {
    return res.render('create', { 
        createPost: true 
    });
  }
  res.redirect('/auth/login');
};
