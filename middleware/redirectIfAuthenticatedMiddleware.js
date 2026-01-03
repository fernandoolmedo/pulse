module.exports = (req, res, next) => {
    if(req.session.userId) {
        return res.redirect('/'); // if user logged in, redirect to the home page
    }
    next()
}