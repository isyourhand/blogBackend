const { Model } = require("mongoose");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const APIFeatures = require("../Utils/APIFeatures");

exports.deleteOne = (Model, ModelEn, type) =>
  catchAsync(async (req, res, next) => {
    const useModel = req.params.lan === "en" ? ModelEn : Model;

    let doc;
    let parentDir;

    doc = await useModel.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that id...🤔", 404));
    }

    if (type === "dir") {
      console.log(doc);
      parentDir = await useModel.findByIdAndUpdate(
        doc.parentId,
        { $pull: { subfolder: doc.id } },
        { new: true }
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
      parentDir,
    });

    // 如果没有额外的代码需要执行，函数会在这里自动返回 undefined
  });

exports.updateOne = (Model, ModelEn) =>
  catchAsync(async (req, res, next) => {
    const useModel = req.params.lan === "cn" ? Model : ModelEn;

    console.log("update body ->", req.body);

    const doc = await useModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model, ModelEn) =>
  catchAsync(async (req, res, next) => {
    console.log("req ->", req.params);

    let newDoc;

    if (req.params.lan === "cn") newDoc = await Model.create(req.body);
    else newDoc = await ModelEn.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        newDoc,
      },
    });
  });

exports.getOne = (Model, ModelEn, popOptions, popOptions2) =>
  catchAsync(async (req, res, next) => {
    const useModel = req.params.lan === "en" ? ModelEn : Model;

    let query = useModel.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    if (popOptions2) query = query.populate(popOptions2);

    const doc = await query;

    console.log("doc", doc);

    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }

    // console.log(doc);

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    // if (req.params.postId) filter = { post: req.params.postId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();

    const docs = await features.query;

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: docs.length,
      data: { docs },
    });
  });
