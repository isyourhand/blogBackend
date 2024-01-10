const mongoose = require("mongoose");

const dirSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    parentId: { type: mongoose.Schema.ObjectId },
    subfolder: [{ type: mongoose.Schema.ObjectId, ref: "Dir" }],
    subfile: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// dirSchema.virtual("postTest", {
//   ref: "Post",
//   foreignField: "folder",
//   localField: "_id",
// });

dirSchema.pre(/^find/, function (next) {
  // console.log("this is query... \n ------------\n", this, "------------");
  // console.log("this is select ->", this._fields);

  if (!this._fields || !this._fields.subfile) {
    this.populate({
      path: "subfile",
      select: "title keyName",
    }).populate({
      path: "subfolder",
      select: "name",
    });
  }

  next();
});

// dirSchema.post("findOne", async function (doc) {
//   if (doc.isPopulate) {
//     await doc.populate({ path: "subfolder", select: "name" });
//     await doc.populate({ path: "subfile", select: "title" });
//   }
// });

// dirSchema.post("find", async function (docs) {
//   for (const doc of docs) {
//     if (doc.isPopulate) {
//       await doc.populate({ path: "subfolder", select: "name" });
//       await doc.populate({ path: "subfile", select: "title" });
//     }
//   }
// });

const Dir = mongoose.model("Dir", dirSchema);

module.exports = Dir;
