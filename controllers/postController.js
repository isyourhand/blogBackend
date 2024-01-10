const path = require("path");
const APIFeatures = require("../Utils/APIFeatures");
const catchAsync = require("../Utils/catchAsync");
const Dir = require("../models/dirModel");
const Post = require("../models/postModel");
const factory = require("./handlerFactory");
const cheerio = require("cheerio");
const sharp = require("sharp");
const PostEn = require("../models/postModelEn");
const DirEn = require("../models/dirModelEn");
const PostLanCollection = require("../models/postLanCollectionModel");

exports.createPostAndAddToFolder = catchAsync(async (req, res, next) => {
  const lan = req.params.lan;

  const Model = lan === "cn" ? Post : PostEn;
  const DirModel = lan === "cn" ? Dir : DirEn;

  const $ = cheerio.load(req.body.content);

  const promises = [];

  // upload imgs to server and update imgElement src.
  $("img").each(async (i, el) => {
    const imgEl = $(el);

    const size = imgEl.prop("style");

    const imageBuffer = Buffer.from(imgEl.attr("src").split(",")[1], "base64");

    const [width, height] = [
      parseInt(size.width, 10),
      parseInt(size.height, 10),
    ];

    const fileName = `${req.body.title}-${Date.now()}-${i}-${lan}.jpeg`;

    imgEl.attr(
      "src",
      `${req.protocol}://${req.get("host")}/${lan}/api/post/img/${fileName}`
    );

    const promise = sharp(imageBuffer);

    if (width) promise.resize(width, height);

    promise
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/post/${fileName}`);

    promises.push(promise);
  });

  await Promise.all(promises);

  // console.log($.html());

  req.body.content = $.html();

  const newPost = await Model.create(req.body);

  console.log("The post has been created...");

  // Add the ID to the parent folder.
  const folder = await DirModel.findByIdAndUpdate(
    req.params.id,
    { $push: { subfile: newPost.id } },
    { new: true } // 返回更新后的文档;
  );

  let LanCollection;
  // Incorporate the ID into the 'Language collection Documentation'.
  LanCollection = await PostLanCollection.findOne({
    uniqueName: newPost.keyName,
  });

  if (LanCollection) {
    lan === "en"
      ? (LanCollection.en = newPost.id)
      : (LanCollection.cn = newPost.id);
  } else {
    LanCollection = new PostLanCollection({
      uniqueName: newPost.keyName,
      [lan]: newPost.id,
    });
  }
  await LanCollection.save();
  console.log("The folder has been updated...");
  // console.log("this is updated folder ->", folder);

  res.status(201).json({
    status: "success",
    data: {
      data: newPost,
    },
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const Model = req.params.lan === "cn" ? Post : PostEn;

  let filter = {};

  const results = await Model.find({}).countDocuments();

  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .limitFields()
    .paginate()
    .sort();

  const posts = await features.query;

  console.log("The posts have been queried...");

  res.status(200).json({
    status: "success",
    results,
    data: {
      posts,
    },
  });
});

exports.getPost = factory.getOne(Post, PostEn);

exports.getPostImg = catchAsync(async (req, res, next) => {
  const sfOptions = {
    root: path.join(__dirname, ".."),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  res.sendFile(`public/img/post/${req.params.fileName}`, sfOptions);
});

exports.updatePost = factory.updateOne(Post, PostEn);
