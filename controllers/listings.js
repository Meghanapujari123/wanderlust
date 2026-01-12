const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

/* ===========================
   INDEX (with search support)
=========================== */
module.exports.index = async (req, res) => {
  const { q } = req.query;
  let allListings;

  if (q) {
    const regex = new RegExp(q, "i");
    allListings = await Listing.find({
      $or: [
        { location: regex },
        { country: regex },
        { category: regex },
        { title: regex }
      ]
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings });
};

/* ===========================
   NEW FORM
=========================== */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

/* ===========================
   SHOW LISTING
=========================== */
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

/* ===========================
   CREATE LISTING
=========================== */
module.exports.createListing = async (req, res) => {
  const geoResponse = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    })
    .send();

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  if (geoResponse.body.features.length > 0) {
    newListing.geometry = geoResponse.body.features[0].geometry;
  }

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

/* ===========================
   EDIT FORM
=========================== */
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

/* ===========================
   UPDATE LISTING
=========================== */
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

/* ===========================
   DELETE LISTING
=========================== */
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

/* ===========================
   CATEGORY FILTER
=========================== */
module.exports.categoryListings = async (req, res) => {
  const { category } = req.params;
  const allListings = await Listing.find({ category });

  res.render("listings/index.ejs", { allListings });
};

/* ===========================
   ICON FILTERS
=========================== */
module.exports.filterListings = async (req, res) => {
  const { type } = req.params;

  let allListings;
  if (type === "trending") {
    allListings = await Listing.find({});
  } else {
    allListings = await Listing.find({ category: type });
  }

  res.render("listings/index.ejs", { allListings });
};

/* ===========================
   SEARCH DROPDOWN API
=========================== */
module.exports.searchDropdown = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.json({ locations: [], countries: [], categories: [] });
  }

  const listings = await Listing.find({
    $or: [
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ]
  }).limit(20);

  const locations = new Set();
  const countries = new Set();
  const categories = new Set();

  listings.forEach(l => {
    if (l.location) locations.add(l.location);
    if (l.country) countries.add(l.country);
    if (l.category) categories.add(l.category);
  });

  res.json({
    locations: [...locations],
    countries: [...countries],
    categories: [...categories]
  });
};

/* ===========================
   SEARCH RESULTS PAGE
=========================== */
module.exports.searchResults = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    const allListings = await Listing.find({});
    return res.render("listings/index.ejs", { allListings });
  }

  const regex = new RegExp(q, "i");

  const allListings = await Listing.find({
    $or: [
      { location: regex },
      { country: regex },
      { category: regex },
      { title: regex }
    ]
  });

  res.render("listings/index.ejs", { allListings });
};
