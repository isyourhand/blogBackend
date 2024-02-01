const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const Dir = require("../models/dirModel");
const DirEn = require("../models/dirModelEn");

const factory = require("./handlerFactory");

exports.getAllDir = factory.getAll(Dir);
exports.getDirById = factory.getOne(
  Dir,
  DirEn
  // { path: "subfile", select: "title" },
  // { path: "subfolder" }
);
exports.createDir = factory.createOne(Dir, DirEn);

exports.deleteDir = factory.deleteOne(Dir, DirEn, "dir");

exports.createAndUpdateParentFolder = catchAsync(async (req, res, next) => {
  const lan = req.params.lan;

  const Model = lan === "cn" ? Dir : DirEn;

  const check = await Model.findById(req.params.id);

  if (!check)
    return next(
      new AppError(
        `The document ID you referred to was not found in the '${lan}' Collection.`
      )
    );

  req.body.parentId = req.params.id;
  req.body.createdAt = Date.now();

  const newDir = await Model.create(req.body);

  const parentDir = await Model.findByIdAndUpdate(
    req.params.id,
    { $push: { subfolder: newDir.id } },
    { new: true }
  );

  // parentDir.subfolder.push(newDir.id);

  // parentDir.save();

  // console.log(parentDir);
  res.status(201).json({
    status: "success",
    data: {
      newDir,
    },
  });
});
