const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/authenticateMiddleware");
const userController = require("../controllers/userController");

router.get("/signup",  userController.getSignup);

router.post("/signup", userController.postSignup);

router.get("/dashboard", ensureAuthenticated, userController.getDashboard);

router.get("/login", userController.getLogin);

router.post("/login", userController.postLogin);

router.get("/logout", userController.getLogout);

module.exports = router;