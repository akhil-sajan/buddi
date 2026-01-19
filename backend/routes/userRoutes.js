const express = require("express");
const { userSignUp, userLogin } = require("../controllers/userControllers.js");
const router = express.Router();
const userController = require("../controllers/userControllers.js");

router.post("/signup", userSignUp);
router.post("/login", userLogin);

module.exports = router;
