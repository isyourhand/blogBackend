const mongoose = require("mongoose");
const slugify = require("slugify");

const postEnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A post must have a title."],
    unique: true,
    trim: true,
  },
  slug: String,
  keyName: {
    type: String,
    required: [true, "A post must have a keyName."],
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  content: {
    require: true,
    type: String,
    trim: true,
  },
  topic: {
    type: String,
    required: [true, "A post must have a topic"],
    enum: {
      values: ["other", "Frontend", "Backend"],
      message: "Topic is either: frontend, backend.",
    },
  },
  secondTopic: {
    type: String,
    required: [true, "A post must have a Second topic"],
    enum: {
      values: [
        "other",
        "reactjs",
        "nodejs",
        "javascript",
        "css",
        "html",
        "mongodb",
        "redis",
      ],
      message: "Second Topic is either: frontend, backend.",
    },
  },
  introduction: {
    type: String,
    required: [true, "A post must have a introduction"],
  },
});

postEnSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const PostEn = mongoose.model("PostEn", postEnSchema);

module.exports = PostEn;
