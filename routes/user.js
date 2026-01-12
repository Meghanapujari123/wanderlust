const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js")
const userController=require("../controllers/users.js");

router
.route("/signup")
.get(userController.renderSignupForm)
 .post(wrapAsync(userController.signup));

 router
 .route("/login")
 .get(userController.renderLoginForm)
 .post(
    saveRedirectUrl,
    passport.authenticate("local",{
    failureRedirect:'/login',
        failureFlash:true}),
        userController.login
);
router.get("/logout",userController.logout);
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

router.post("/wishlist/:id", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id);
  const listingId = req.params.id;

  if (user.wishlist.includes(listingId)) {
    user.wishlist.pull(listingId);
  } else {
    user.wishlist.push(listingId);
  }

  await user.save();
  res.redirect("back");
});

module.exports=router;