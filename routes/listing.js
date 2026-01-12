const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// SEARCH
router.get("/search", wrapAsync(listingController.searchResults));
router.get("/search-dropdown", wrapAsync(listingController.searchDropdown));

// FILTERS
router.get("/category/:category", wrapAsync(listingController.categoryListings));
router.get("/filter/:type", wrapAsync(listingController.filterListings));

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW / UPDATE / DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
