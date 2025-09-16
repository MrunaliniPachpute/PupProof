const User = require("../models/User");

exports.postWallet = async (req, res) => {
  try {
    console.log("Save wallet hit!");
    console.log("req.user:", req.user);
    console.log("req.session:", req.session);

    const { wallet } = req.body;
    console.log("Wallet from body:", wallet);

    if (!req.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $set: { walletAddress: wallet } }
    );

    res.json({ success: true, wallet });
  } catch (err) {
    console.error("Save wallet error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.postMintCoins = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not logged in" });
    }
    const coinsToMint = 5;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.coins = (user.coins || 0) + coinsToMint;
    await user.save();
    req.user.coins = user.coins;
    res.json({ success: true, newBalance: user.coins });
  } catch (err) {
    console.error("Mint coins error:", err);
    res.status(500).json({ error: "Server error" });
  }
}