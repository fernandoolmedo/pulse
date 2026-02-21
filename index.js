// index.js
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const flash = require('connect-flash');

//const fs = require('fs');

//const uploadDir = path.join(__dirname, 'public', 'img');
//fs.mkdirSync(uploadDir, { recursive: true }); // ensures /public/img exists

const app = express();

// Environment-based settings
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  app.disable('view cache');   // safe now
  mongoose.set('debug', true);
}

// View + static + body parsers
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (before flash, and before any middleware that uses req.session)
if (isProd) app.set('trust proxy', 1);

// In production, require SESSION_SECRET to be set for security. In development, we provide a default for convenience.
const sessionSecret =
  process.env.SESSION_SECRET || (!isProd ? 'keyboard cat' : null);

if (!sessionSecret) {
  console.error('SESSION_SECRET is not set (required in production).');
  process.exit(1);
}

// Session store in MongoDB
app.use(session({
  name: 'sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  proxy: isProd,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 7, // 7 days
    autoRemove: 'native' // Let MongoDB handle expired session cleanup
  }),

  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,                 // true on HTTPS in prod
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Flash (after session)
app.use(flash());

// Expose auth + flash to all views
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId || null; // no req.flash here
  next();
});

// Multer memory storage (Heroku disk is ephemeral)
const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image uploads are allowed'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Controllers & middleware
const homeController = require('./controllers/home.js');
const storePostController = require('./controllers/storePost.js');
const getPostController = require('./controllers/getPost.js');
const newPostController = require('./controllers/newPost.js');
const reactionsController = require('./controllers/reactions.js');
const newUserController = require('./controllers/newUser.js');
const storeUserController = require('./controllers/storeUser.js');
const loginController = require('./controllers/login.js');
const loginUserController = require('./controllers/loginUser.js');
const logoutController = require('./controllers/logout.js');
const authMiddleware = require('./middleware/authMiddleware.js');
const validateMiddleWare = require('./middleware/validationMiddleware.js');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware.js');

// Admin-only endpoint to check analytics logger health and drop stats.
const { getDropStats } = require('./middleware/analyticsLogger');
app.get('/admin/analytics-health', (req, res) => {
  if (isProd && !req.session?.userId) return res.sendStatus(403);
  res.json(getDropStats());
});

// Routes
app.get('/', homeController);
app.post('/user/register', redirectIfAuthenticatedMiddleware, storeUserController);
app.get('/post/:id', getPostController);
app.get('/posts/new', authMiddleware, newPostController);
app.get('/post/:id/reactions', reactionsController.getReactions);
app.put('/post/:id/reaction', reactionsController.setReaction);
app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
app.get('/auth/login', redirectIfAuthenticatedMiddleware, loginController);
app.get('/auth/logout', logoutController);
app.post(
  '/post/store',
  authMiddleware,
  upload.single('image'),
  validateMiddleWare,
  storePostController
);
app.post('/user/login', redirectIfAuthenticatedMiddleware, loginUserController);

// Simple health endpoint
app.get('/pythonrequest', (req, res) => {
  res.json({ message: 'Hello Python requester! 🎉', timestamp: new Date().toISOString() });
});

// 404 handler after all routes
app.use((req, res) => res.status(404).render('notfound'));

// Multer error handler
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).send('Image too large (max 5MB).');
  }
  if (err && err.message === 'Only image uploads are allowed') {
    return res.status(400).send(err.message);
  }
  next(err);
});

// Global error handler LAST
app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack || err);
  res.status(500).send('Something went wrong.');
});

// Connect then start server
(async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('MONGO_URL is not set. Add it in Heroku config vars.');
    }

    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected');

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`App listening on port ${port}`));
  } catch (e) {
    console.error('Mongo connection failed:', e);
    process.exit(1);
  }
})();

