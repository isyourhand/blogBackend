const express = require("express");
const {
  login,
  signup,
  logout,
  whoami,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/login", logout);
router.get("/whoami", whoami);

module.exports = router;
