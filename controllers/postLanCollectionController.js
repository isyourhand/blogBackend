const catchAsync = require("../Utils/catchAsync");
const PostLanCollection = require("../models/postLanCollectionModel");
const factory = require("./handlerFactory");

exports.createPostLanCollection = factory.createOne(
  PostLanCollection,
  PostLanCollection
);

exports.getPostLanCollectionByName = catchAsync(async (req, res, next) => {
  const doc = await PostLanCollection.findOne({
    uniqueName: req.params.uniqueName,
  }).populate(req.params.lan);

  console.log("Fetching file from the database...");

  // console.log(doc);

  res.status(200).json({
    status: "success",
    data: {
      doc,
    },
  });
});
