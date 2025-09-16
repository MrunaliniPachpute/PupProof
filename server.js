const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const Port = 3000;
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));

// Sessions & Auth
const session = require("express-session");
const passport = require("./utils/passportConfig");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: "pupproof",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Flash messages → locals
app.use((req, res, next) => {
  res.locals.success = req.flash("success")[0] || "";
  res.locals.wrong = req.flash("wrong")[0] || "";
  next();
});

// Views & Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout/boilerplate");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

// ROUTES
app.use("/home", require("./routes/homeRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/refill", require("./routes/refillEventRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/wallet", require("./routes/walletRoutes"));
app.use("/ipfs", require("./routes/ipfsRoutes"));

app.listen(Port, () => {
  console.log(`We are listening at http://localhost:${Port}/home`);
});
