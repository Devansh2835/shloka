const express = require('express');
const router = express.Router();
const User = require('../models/user');

// show signup form
router.get('/signup', (req, res) => {
  res.render('signup', { messages: req.flash() });
});

// handle signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/signup');
    }
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'Email already registered');
      return res.redirect('/signup');
    }
    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    // log user in via session
    req.session.userId = user._id;
    req.flash('success', 'Signup successful');
    return res.redirect('/');
  } catch (err) {
    console.error('Signup error', err);
    req.flash('error', 'Could not create account');
    return res.redirect('/signup');
  }
});

// show login form
router.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

// handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Missing credentials');
      return res.redirect('/login');
    }
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    const ok = await user.verifyPassword(password);
    if (!ok) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    req.session.userId = user._id;
    req.flash('success', 'Welcome back');
    return res.redirect('/');
  } catch (err) {
    console.error('Login error', err);
    req.flash('error', 'Login failed');
    return res.redirect('/login');
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
