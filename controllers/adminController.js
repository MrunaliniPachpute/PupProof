const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const RefillEvent = require("../models/RefillEvent");

exports.getadminSignUp = (req, res) => {
  res.render("modules/adminSignup", {
    wrong: req.flash("wrong"),
    success: req.flash("success"),
  });
};

exports.postAdminSignUp = async (req, res) => {
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
};

exports.getAdminLogin =  (req, res) => {
  res.render("modules/adminLogin");
};

exports.postAdminLogin = async (req, res) => {
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
};

exports.getAdminDashboard = async (req, res) => {
  const requests = await RefillEvent.find({})
    .populate("userId")
    .sort({ timestamp: -1 });
  res.render("modules/adminDashboard", { requests });
};

exports.postAcceptRefill = async (req, res) => {
  const request = await RefillEvent.findById(req.params.id).populate("userId");
  if (request && request.status === "pending") {
    request.status = "completed";
    request.pointsEarned = 1; //dashboard sum
    await request.save();
    //update in wallet bal.
    const user = request.userId;
    user.coins = (user.coins || 0) + request.pointsEarned;
    await user.save();
    console.log(
      `Minted ${request.pointsEarned} PupCoins to ${
        user.walletAddress || "DB only"
      }`
    );
  }

  res.redirect("/admin/dashboard");
}

exports.postRejectRefill = async (req, res) => {
  const request = await RefillEvent.findById(req.params.id).populate("userId");
  if (request && request.status === "pending") {
    request.status = "failed";
    request.pointsEarned = -0.5;
    await request.save();

    const user = request.userId;
    if (user.walletAddress) {
      user.coins = (user.coins || 0) + request.pointsEarned;
      await user.save();
      console.log(
        `Minted ${request.pointsEarned} PupCoins to ${user.walletAddress}`
      );
    }
  }
  res.redirect("/admin/dashboard");
};

exports.postAdminLogout = (req, res) => {
  req.session.isAdmin = false;
  res.redirect("/admin/login");
};