const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const cors = require("cors");
const flash = require("connect-flash");
const multer = require("multer");

module.exports = (app) => {

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layout/boilerplate");
  app.use(expressLayouts);

 
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(express.static("public"));

  app.use(cors());

  const upload = multer({ storage: multer.memoryStorage() });
  app.use(upload.any()); 

  app.use(flash());

  app.use((req, res, next) => {
    const successMsgs = req.flash("success");
    const wrongMsgs = req.flash("wrong");
    res.locals.success = successMsgs.length > 0 ? successMsgs[0] : "";
    res.locals.wrong = wrongMsgs.length > 0 ? wrongMsgs[0] : "";
    next();
  });

   app.locals.upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
};


