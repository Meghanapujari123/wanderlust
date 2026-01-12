router.get("/dashboard", isAdmin, async (req, res) => {
  const users = await User.countDocuments();
  const listings = await Listing.countDocuments();
  const bookings = await Booking.countDocuments();

  res.render("admin/dashboard.ejs", { users, listings, bookings });
});
