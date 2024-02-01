const mongoose = require("mongoose");

const dirEnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    parentId: { type: mongoose.Schema.ObjectId },
    subfolder: [{ type: mongoose.Schema.ObjectId, ref: "DirEn" }],
    subfile: [{ type: mongoose.Schema.ObjectId, ref: "PostEn" }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

dirEnSchema.pre(/^find/, function (next) {
  if (!this._fields || !this._fields.subfile) {
    this.populate({
      path: "subfile",
      select: "title keyName",
    }).populate({
      path: "subfolder",
      select: "name createdAt",
    });
  }

  next();
});

const DirEn = mongoose.model("DirEn", dirEnSchema);

module.exports = DirEn;
