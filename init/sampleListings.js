const sampleListings = [
  {
    title: "Cozy Beach House",
    description: "Beautiful beachside home with sea view",
    price: 3500,
    location: "Goa",
    country: "India",
    category: "Beach",
    image: {
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      filename: "beach-house"
    },
    geometry: {
      type: "Point",
      coordinates: [73.8278, 15.2993]
    }
  },
  {
    title: "Mountain Cabin Retreat",
    description: "Peaceful cabin in the mountains",
    price: 2800,
    location: "Manali",
    country: "India",
    category: "Mountains",
    image: {
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      filename: "mountain-cabin"
    },
    geometry: {
      type: "Point",
      coordinates: [77.1887, 32.2396]
    }
  },
  {
    title: "Luxury City Apartment",
    description: "Modern apartment in city center",
    price: 4500,
    location: "Bangalore",
    country: "India",
    category: "City",
    image: {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      filename: "city-apartment"
    },
    geometry: {
      type: "Point",
      coordinates: [77.5946, 12.9716]
    }
  }
];

module.exports = sampleListings;
