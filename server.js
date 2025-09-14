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
const { v4: uuidv4 } = require("uuid");
const { feedDog } = require("./views/utils/arduinoController");
const session = require("express-session");
const passport = require("./views/utils/passportConfig");
const User = require("./views/models/User");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const RefillEvent = require("./views/models/RefillEvent");
const MongoStore = require("connect-mongo");
const Admin = require("./views/models/Admin");

mongoose
  .connect("mongodb://127.0.0.1:27017/pupproof", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const DogEvent = require("./views/models/DogEvent");

// Utils
const { hashBuffer, hamming } = require("./views/utils/hash");
const { uploadToPinata } = require("./views/utils/pinata");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const upload = multer({ storage: multer.memoryStorage() });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout/boilerplate");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.wrong = req.flash("wrong");
  next();
});

//HOME ROUTES
app.get("/home", (req, res) => res.render("modules/homePage"));

app.post("/home/fetchFood", upload.single("noseImage"), async (req, res) => {
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
      const dogType = active.isPuppy ? "Puppy" : "Dog";
      return res.render("modules/fetchFood", {
        duration: hoursLeft,
        isAlreadyFed: true,
        dogType,
      });
    }

    const isPuppy = await detectDogType(imgBuf);
    const duration = isPuppy ? 3 : 5;
    const servoDurationMs = isPuppy ? 3000 : 5000;
    feedDog(servoDurationMs);
    console.log("DURATION ", duration);
    const dogType = isPuppy ? "Puppy" : "Doggy";
    const expiresAt = new Date(Date.now() + duration * 3600 * 1000);
    console.log(`ispup? ${isPuppy}`);
    // Upload to IPFS
    const cid = await uploadToPinata(imgBuf, "nose.jpg");

    await DogEvent.create({
      phash: pHash,
      isPuppy,
      foodDurationSec: duration,
      expiresAt,
      noseCid: cid,
    });

    res.render("modules/fetchFood", { duration, isAlreadyFed: false, dogType });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//USER ROUTES
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/user/login");
}

app.get("/user/signup", (req, res) => {
  res.render("modules/SignUp.ejs");
});
app.post("/user/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("wrong", "Passwords do not match!");
    return res.redirect("/user/signup");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("wrong", "Email already registered!");
      return res.redirect("/user/login");
    }

    const user = new User({ name, email, password });
    await user.save();

    req.login(user, (err) => {
      if (err) return next(err);
      req.flash(
        "success",
        "Signup successful! Welcome " + user.name + "to PupProof"
      );
      res.redirect("modules/dashboard");
    });
  } catch (err) {
    console.error(err);
    req.flash("wrong", "Error creating user: " + err.message);
    res.redirect("/user/signup");
  }
});

app.get("/user/dashboard", ensureAuthenticated, async (req, res) => {
  const user = req.user;
  const history = await RefillEvent.find({ userId: user._id }).sort({
    timestamp: -1,
  });

  const totalPoints = history.reduce(
    (sum, e) => sum + (e.pointsEarned || 0),
    0
  );

  res.render("modules/dashboard", {
    user,
    history,
    totalPoints,
    success: req.flash("success"),
    wrong: req.flash("wrong"),
  });
});

app.get("/user/login", (req, res) => {
  res.render("modules/Login.ejs");
});

app.post(
  "/user/login",
  passport.authenticate("local", {
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true,
  })
);

app.get("/user/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully!");
    res.redirect("/home");
  });
});

app.post(
  "/refill",
  upload.fields([{ name: "beforeFill" }, { name: "afterFill" }]),
  async (req, res) => {
    try {
      const beforeImg = req.files.beforeFill[0];
      const afterImg = req.files.afterFill[0];

      const beforeCid = await uploadToPinata(beforeImg.buffer, beforeImg.originalname);
      const afterCid = await uploadToPinata(afterImg.buffer, afterImg.originalname);

      const beforeUrl = `https://gateway.pinata.cloud/ipfs/${beforeCid}`;
      const afterUrl = `https://gateway.pinata.cloud/ipfs/${afterCid}`;

      await RefillEvent.create({
        userId: req.user._id,
        machineId: uuidv4(),
        beforeImg: beforeUrl,  // IPFS link
        afterImg: afterUrl,    //IPFS link
        pointsEarned: 1,
        status: "pending",
      });

      req.flash("success", "Refill submitted! Points earned.");
      res.redirect("/user/dashboard");
    } catch (err) {
      console.error(err);
      req.flash("wrong", "Error submitting refill: " + err.message);
      res.redirect("/user/dashboard");
    }
  }
);


//ADMIN ROUTES

app.get("/admin/signup", (req, res) => {
  res.render("modules/adminSignup", {
    wrong: req.flash("wrong"),
    success: req.flash("success"),
  });
});

app.post("/admin/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("wrong", "Passwords do not match!");
    return res.redirect("/admin/signup");
  }

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      req.flash("wrong", "Email already registered!");
      return res.redirect("/admin/signup");
    }

    const admin = new Admin({ name, email, password });
    await admin.save();

    // Automatically log in the admin
    req.session.isAdmin = true;
    req.session.adminId = admin._id;

    req.flash("success", "Admin account created successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("wrong", "Error creating admin: " + err.message);
    res.redirect("/admin/signup");
  }
});

app.get("/admin/login", (req, res) => {
  res.render("modules/adminLogin", { wrong: req.flash("wrong") });
});

app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    req.flash("wrong", "Invalid credentials");
    return res.redirect("/admin/login");
  }

  req.session.isAdmin = true;
  req.session.adminId = admin._id; // Add this
  req.flash("success", "Welcome back, " + admin.name);
  res.redirect("/admin/dashboard");
});

function ensureAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect("/admin/login");
}

app.get("/admin/dashboard", ensureAdmin, async (req, res) => {
  const requests = await RefillEvent.find({})
    .populate("userId")
    .sort({ timestamp: -1 });
  res.render("modules/adminDashboard", { requests });
});

app.post("/admin/request/:id/accept", ensureAdmin, async (req, res) => {
  const request = await RefillEvent.findById(req.params.id).populate("userId");
  if (request && request.status === "pending") {
    request.status = "completed";
    request.pointsEarned = 1; // <-- this is what the dashboard sums
    await request.save();
  }
  res.redirect("/admin/dashboard");
});

app.post("/admin/request/:id/reject", ensureAdmin, async (req, res) => {
  const request = await RefillEvent.findById(req.params.id).populate("userId");
  if (request && request.status === "pending") {
    request.status = "failed";
    request.pointsEarned = 0; // or -0.5 if you want negative points
    await request.save();
  }
  res.redirect("/admin/dashboard");
});

app.get("/admin/logout", (req, res) => {
  req.session.isAdmin = false;
  res.redirect("/admin/login");
});

app.listen(Port, () => {
  console.log(`We are listening at http://localhost:${Port}`);
});
