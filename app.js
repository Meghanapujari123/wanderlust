// =======================
// LOAD ENV VARIABLES
// =======================
if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}

// =======================
// CORE IMPORTS
// =======================
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

// =======================
// SESSION + AUTH
// =======================
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // ✅ v6 correct import
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// =======================
// ROUTES
// =======================
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const bookingRouter = require("./routes/booking");



// =======================
// DATABASE
// =======================
const dbUrl = process.env.ATLASDB_URL;

// =======================
// CONNECT TO MONGODB
// =======================
mongoose
  .connect(dbUrl)
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log("DB ERROR:", err));

// =======================
// APP CONFIG
// =======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =======================
// SESSION STORE (MONGO)
// =======================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET, // ✅ MUST exist in .env
  },
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", (err) => {
  console.log("SESSION STORE ERROR:", err);
});

app.use(
  session({
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(flash());

// =======================
// PASSPORT CONFIG
// =======================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// GLOBAL LOCALS
// =======================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// =======================
// ROUTES
// =======================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/bookings", bookingRouter);

// =======================
// 404 HANDLER (NO "*")
// =======================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("err.ejs", { message });
});

// =======================
// START SERVER
// =======================

module.exports = app;
