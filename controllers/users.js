const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const isOwner = require('../middleware/is-owner');
const isSignedIn = require('../middleware/is-signed-in');

// COMMUNITY PAGE – list all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('users/index', { users });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// SHOW another user's library (only if logged in)
router.get('/:id', isSignedIn, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.id);
    if (!otherUser) return res.status(404).render('errors/mediaNotFound');

    res.render('users/library', {
      otherUser,
      library: otherUser.library,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/mediaNotFound');
  }
});

// SHOW another user's specific media item (always logged in)
router.get('/:userId/medias/view/:itemId', isSignedIn, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) return res.status(404).render('errors/mediaNotFound');

    const media = otherUser.library.id(req.params.itemId);
    if (!media) return res.status(404).render('errors/mediaNotFound');

    res.render('medias/showOther', { media, otherUser });
  } catch (err) {
    console.error(err);
    res.status(500).render('errors/mediaNotFound');
  }
});

// EDIT a media item (owner only)
router.get(
  '/:userId/medias/:itemId/edit',
  isSignedIn,
  isOwner,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const media = user.library.id(req.params.itemId);
      if (!media) return res.status(404).render('errors/mediaNotFound');

      res.render('medias/edit', { media, user });
    } catch (err) {
      console.error(err);
      res.status(500).render('errors/mediaNotFound');
    }
  }
);

module.exports = router;
