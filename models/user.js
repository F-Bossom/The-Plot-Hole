const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, "Media name cannot be empty"],
  },
  type: {
    type: String,
    enum: ["Book", "Movie", "Show"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Planned", "In-Progress", "Completed"],
    default: "Planned",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: [
    {
      text: {
        type: String,
        trim: true,
        minlength: 1, // only enforced if text exists
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
});



const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  library: [mediaSchema], 
});

const User = mongoose.model("User", userSchema);

module.exports = User;

