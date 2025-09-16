const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const homeController = require("../controllers/homeController");
// Render home page
router.get("/", homeController.getHome);

// Handle noseprint upload
router.post("/fetchFood",upload.single("noseImage"), homeController.postFetchFood);

module.exports = router;
