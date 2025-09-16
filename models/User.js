const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  coins: { type: Number, default: 0 },
  walletAddress: { type: String, default: null },
  role: { type: String, enum: ['user','admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre("save", async function(next) { //encrypt hash
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// password validation
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", userSchema);