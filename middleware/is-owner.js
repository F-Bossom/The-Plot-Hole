const User = require("../models/user");

const isOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.status(403).render("errors/mediaNotFound");
    }

    // Check if the media exists in this user's library
    const media = user.library.id(req.params.itemId);
    if (!media) {
      return res.status(404).render("errors/mediaNotFound");
    }

    // All good
    next();
  } catch (err) {
    console.error(err);
    res.status(500).render("errors/mediaNotFound");
  }
};

module.exports = isOwner;
