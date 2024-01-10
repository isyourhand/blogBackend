const express = require("express");
const {
  getAllPosts,
  getPost,
  createPostAndAddToFolder,
  getPostImg,
  updatePost,
} = require("../controllers/postController");
const {
  protect,
  restrictTo,
  isLoggedIn,
} = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.get("/img/:fileName", getPostImg);

router.route("/:id").get(getPost);
router.route("/").get(getAllPosts);

router.use(protect, restrictTo("admin"));

router
  .route("/:id")

  .post(createPostAndAddToFolder)
  .patch(updatePost);

module.exports = router;
