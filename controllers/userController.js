const passport = require("../utils/passportConfig");
const User = require("../models/User");
const RefillEvent = require("../models/RefillEvent");

exports.getSignup = (req, res) => {
  res.render("modules/SignUp.ejs");
};

exports.postSignup = async (req, res) => {
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
      res.redirect("/user/dashboard");
    });
  } catch (err) {
    console.error(err);
    req.flash("wrong", "Error creating user: " + err.message);
    res.redirect("/user/signup");
  }
};

exports.getDashboard = async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log("User from DB:", user);
  const history = await RefillEvent.find({ userId: user._id }).sort({
    timestamp: -1,
  });
  console.log("Refill history:", history); // <-- add this

  const totalPoints = history.reduce(
    (sum, e) => sum + (e.pointsEarned || 0),
    0
  );

  res.render("modules/dashboard", {
    user,
    history,
    totalPoints: user.coins || 0 ,
  });
};

exports.getLogin = (req, res) => {
  res.render("modules/Login.ejs");
};

exports.postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("wrong", "Invalid email or password");
      return res.redirect("/user/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome back, ${user.name}`);
      return res.redirect("/user/dashboard");
    });
  })(req, res, next);
};

exports.getLogout =  (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out successfully!");
    res.redirect("/home");
  });
};