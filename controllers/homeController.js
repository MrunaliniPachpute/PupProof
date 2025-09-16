const detectDogType = require("../utils/detectDogType");
const { feedDog } = require("../utils/arduinoController");
const DogEvent = require("../models/DogEvent");
const { hashBuffer } = require("../utils/hash");
const { uploadToPinata } = require("../utils/pinata");


exports.getHome = (req, res) => res.render("modules/homePage");

exports.postFetchFood = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).send("No image uploaded");
    }

    const imgBuf = req.file.buffer;
    const pHash = await hashBuffer(imgBuf);

    const active = await DogEvent.findOne({ phash: pHash });
    if (active) {
      const hoursLeft = Math.ceil((active.expiresAt - new Date()) / 3600000);
      return res.render("modules/fetchFood", { 
        duration: hoursLeft, 
        isAlreadyFed: true, 
        dogType: active.isPuppy ? "Puppy" : "Dog" 
      });
    }

    const isPuppy = await detectDogType(imgBuf);
    const duration = isPuppy ? 3 : 5; // hours
    feedDog(duration * 1000); // milliseconds for Arduino

    const expiresAt = new Date(Date.now() + duration * 3600 * 1000);
    const cid = await uploadToPinata(imgBuf, "nose.jpg");

    await DogEvent.create({
      phash: pHash,
      isPuppy,
      foodDurationSec: duration,
      expiresAt,
      noseCid: cid,
    });

    res.render("modules/fetchFood", { 
      duration, 
      isAlreadyFed: false, 
      dogType: isPuppy ? "Puppy" : "Doggy" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};