const express = require("express");
const router = express.Router();

const walletController = require("../controllers/walletController");

router.post("/save-wallet", walletController.postWallet);

router.post("/mint-coins", walletController.postMintCoins);

module.exports = router;