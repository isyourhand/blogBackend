const express = require("express");
const postLanCollectionController = require("../controllers/postLanCollectionController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.get(
  "/:uniqueName",
  postLanCollectionController.getPostLanCollectionByName
);

router.use(protect, restrictTo("admin"));
router.route("/").post(postLanCollectionController.createPostLanCollection);

module.exports = router;
