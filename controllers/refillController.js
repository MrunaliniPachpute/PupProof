const RefillEvent = require("../models/RefillEvent");
const { v4: uuidv4 } = require("uuid");
const { uploadToPinata } = require("../utils/pinata");
const upload = require("../middleware/upload");

exports.postRefill = [
  upload.fields([{ name: "beforeFill" }, { name: "afterFill" }]),
  async (req, res) => {
    try {
      const beforeImg = req.files.beforeFill[0];
      const afterImg = req.files.afterFill[0];

      const beforeCid = await uploadToPinata(beforeImg.buffer, beforeImg.originalname);
      const afterCid = await uploadToPinata(afterImg.buffer, afterImg.originalname);

      await RefillEvent.create({
        userId: req.user._id,
        machineId: uuidv4(),
        beforeImg: beforeCid,
        afterImg: afterCid,
        pointsEarned: 0,
        status: "pending",
      });

      req.flash("success", "Refill submitted for review!");
      res.redirect("/user/dashboard");
    } catch (err) {
      console.error(err);
      req.flash("wrong", "Error submitting refill: " + err.message);
      res.redirect("/user/dashboard");
    }
  },
];
