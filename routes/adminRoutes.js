const { ensureAdmin } = require("../utils/authenticateMiddleware");
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
router.get("/signup", adminController.getadminSignUp);

router.post("/signup", adminController.postAdminSignUp);

router.get("/login", adminController.getAdminLogin);

router.post("/login", adminController.postAdminLogin);

router.get("/dashboard", ensureAdmin, adminController.getAdminDashboard);

router.post("/request/:id/accept", ensureAdmin, adminController.postAcceptRefill);

router.post("/request/:id/reject", ensureAdmin, adminController.postRejectRefill);

router.get("/logout", adminController.postAdminLogout);

module.exports = router;
