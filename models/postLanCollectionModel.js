const mongoose = require("mongoose");

const postLanCollectionSchema = new mongoose.Schema({
  uniqueName: {
    type: String,
    required: [true, "must have a uniqueName..."],
    unique: true,
  },

  en: {
    type: mongoose.Schema.ObjectId,
    ref: "PostEn",
  },
  cn: {
    type: mongoose.Schema.ObjectId,
    ref: "Post",
  },
});

const PostLanCollection = mongoose.model(
  "PostLanCollection",
  postLanCollectionSchema
);

module.exports = PostLanCollection;
