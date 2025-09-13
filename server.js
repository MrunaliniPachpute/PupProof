const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const Port = 3000;
const multer = require("multer");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const detectDogType = require("./views/utils/detectDogType");
dotenv.config();
const { feedDog } = require("./views/utils/arduinoController");

mongoose.connect("mongodb://127.0.0.1:27017/pupproof", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Models
const DogEvent = require('./views/models/DogEvent');

// Utils
const { hashBuffer, hamming } = require('./views/utils/hash');
const { uploadToPinata } = require('./views/utils/pinata');


const upload = multer({ storage: multer.memoryStorage() });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout/boilerplate");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); 

app.get('/', (req, res) => res.render("modules/homePage"));

app.post('/fetchFood', upload.single('noseImage'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).send("No image uploaded");
    }

    const imgBuf = req.file.buffer;
    const pHash = await hashBuffer(imgBuf);
    // console.log(`phash ${pHash}`);
    
    const active = await DogEvent.findOne({ phash: pHash });
    if (active) {
      const hoursLeft = Math.ceil((active.expiresAt - new Date()) / 3600000);
      const dogType = (active.isPuppy) ? "Puppy" : "Dog";
      return res.render('modules/fetchFood', { duration: hoursLeft, isAlreadyFed: true, dogType });
    }
    
    const isPuppy = await detectDogType(imgBuf);
    const duration = isPuppy ? 3 : 5;
    const servoDurationMs  = isPuppy ? 3000 : 5000;
    feedDog(servoDurationMs);
    console.log("DURATION ", duration);
    const dogType = (isPuppy) ? "Puppy" : "Doggy";
    const expiresAt = new Date(Date.now() + duration * 3600 * 1000);
    console.log(`ispup? ${isPuppy}`);
    // Upload to IPFS
    const cid = await uploadToPinata(imgBuf, 'nose.jpg');

    await DogEvent.create({
      phash: pHash,
      isPuppy,
      foodDurationSec: duration,
      expiresAt,
      noseCid: cid
    });

    res.render('modules/fetchFood', { duration, isAlreadyFed: false,dogType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.listen(Port , ()=>{
  console.log(`We are listening at http://localhost:${Port}`);
})