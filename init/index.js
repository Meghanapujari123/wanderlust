require("dotenv").config();
const mongoose = require("mongoose");

const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

const sampleListings = require("./sampleListings.js");
const sampleReviews = require("./sampleReviews.js");


const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB");
}

const seedDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});

  const users = await User.find({});
  if (users.length === 0) {
    console.log("⚠️ No users found. Please signup at least one user first.");
    return;
  }

  for (let listingData of sampleListings) {
    const owner = users[Math.floor(Math.random() * users.length)];

    const listing = new Listing(listingData);
    listing.owner = owner._id;

    for (let i = 0; i < 2; i++) {
      const reviewData =
        sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

      const review = new Review({
        ...reviewData,
        author: owner._id,
      });

      await review.save();
      listing.reviews.push(review._id);
    }

    await listing.save();
  }

  console.log("🌱 Database seeded with listings + reviews!");
};

main()
  .then(seedDB)
  .then(() => mongoose.connection.close())
  .catch((err) => console.log(err));
