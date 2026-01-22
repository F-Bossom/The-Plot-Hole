const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const isSignedIn = require("../middleware/is-signed-in");
const isOwner = require("../middleware/is-owner");

// INDEX - show all media for logged-in user
router.get("/", isSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).render("errors/mediaNotFound");

    res.render("medias/index", { library: user.library, user });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// NEW - form to add media
router.get("/new", isSignedIn, (req, res) => {
  res.render("medias/new", { userId: req.params.userId, error: null });
});

// CREATE - add media
router.post("/", isSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).render("errors/mediaNotFound");

    const name = req.body.name?.trim();
    if (!name)
      return res.render("medias/new", { user, error: "Media name cannot be empty." });

    user.library.push({
      name,
      type: req.body.type,
      status: req.body.status,
      rating: req.body.rating || null,
    });

    await user.save();
    res.redirect(`/users/${user._id}/medias`);
  } catch (err) {
    console.error(err);
    res.render("medias/new", { user: req.session.user, error: "Something went wrong." });
  }
});

// SHOW - single media (owner only)
router.get("/:itemId", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);

    res.render("medias/show", { media, user, noteError: req.query.noteError || null });
  } catch (err) {
    console.error(err);
    res.redirect(`/users/${req.session.user._id}/medias`);
  }
});

// EDIT - form (owner only)
router.get("/:itemId/edit", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);

    res.render("medias/edit", { media, user });
  } catch (err) {
    console.error(err);
    res.status(500).render("errors/mediaNotFound");
  }
});

// UPDATE - owner only
router.put("/:itemId", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);

    media.set({
      name: req.body.name,
      type: req.body.type,
      status: req.body.status,
      rating: req.body.rating ? parseInt(req.body.rating) : null,
    });

    await user.save();
    res.redirect(`/users/${user._id}/medias`);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// DELETE - owner only
router.delete("/:itemId", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);

    media.deleteOne();
    await user.save();
    res.redirect(`/users/${user._id}/medias`);
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// VIEW another user's media (view only)
router.get("/:itemId/view/:ownerId", isSignedIn, async (req, res) => {
  try {
    const owner = await User.findById(req.params.ownerId);
    const media = owner.library.id(req.params.itemId);
    if (!media) return res.status(404).render("errors/mediaNotFound");

    res.render("medias/showOther", { media, otherUser: owner });
  } catch (err) {
    console.error(err);
    res.status(500).render("errors/mediaNotFound");
  }
});

// NOTES (all owner-only)
router.post("/:itemId/notes", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);
    const text = req.body.text?.trim();

    if (!text) return res.redirect(`/users/${user._id}/medias/${media._id}?noteError=empty`);

    media.notes.push({ text, createdAt: new Date() });
    await user.save();
    res.redirect(`/users/${user._id}/medias/${media._id}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/users/${req.session.user._id}/medias/${req.params.itemId}`);
  }
});

router.get("/:itemId/notes/:noteId/edit", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);
    const note = media.notes.id(req.params.noteId);

    res.render("medias/editNote", { media, note, user });
  } catch (err) {
    console.error(err);
    res.redirect(`/users/${req.session.user._id}/medias/${req.params.itemId}`);
  }
});

router.put("/:itemId/notes/:noteId", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);
    const note = media.notes.id(req.params.noteId);

    const text = req.body.text?.trim();
    if (!text) return res.redirect(`/users/${user._id}/medias/${media._id}`);

    note.text = text;
    note.updatedAt = new Date();
    await user.save();

    res.redirect(`/users/${user._id}/medias/${media._id}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/users/${req.session.user._id}/medias/${req.params.itemId}`);
  }
});

router.delete("/:itemId/notes/:noteId", isSignedIn, isOwner, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const media = user.library.id(req.params.itemId);
    const note = media.notes.id(req.params.noteId);

    note.deleteOne();
    await user.save();

    res.redirect(`/users/${user._id}/medias/${media._id}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/users/${req.session.user._id}/medias/${req.params.itemId}`);
  }
});

module.exports = router;

