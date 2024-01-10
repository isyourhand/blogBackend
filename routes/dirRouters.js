const express = require("express");
const {
  getDirById,
  createDir,
  getAllDir,
  createAndUpdateParentFolder,
  deleteDir,
} = require("../controllers/dirController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.route("/:id").get(getDirById);

router.use(protect, restrictTo("admin"));

router.route("/").post(createDir);

router.route("/:id").get(getDirById).delete(deleteDir);

router.post("/create/:id", createAndUpdateParentFolder);

module.exports = router;
