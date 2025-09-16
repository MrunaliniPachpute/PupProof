const express = require("express");
const router = express.Router();
const ipfsController = require("../controllers/ipfsController");

router.get("/:cid", ipfsController.getIpfs);

module.exports = router;