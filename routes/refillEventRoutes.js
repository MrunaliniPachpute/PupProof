const express = require("express");
const router = express.Router();
const refillController = require("../controllers/refillController");
router.post("/", refillController.postRefill);

module.exports = router;