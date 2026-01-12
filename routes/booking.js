const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

router.post("/:id", isLoggedIn, async (req, res) => {
  const { checkIn, checkOut } = req.body;
  const listing = await Listing.findById(req.params.id);

  const days =
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn,
    checkOut,
    totalPrice: days * listing.price,
  });

  await booking.save();
  res.redirect("/bookings");
});

router.get("/", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("listing");
  res.render("bookings/index.ejs", { bookings });
});

module.exports = router;
