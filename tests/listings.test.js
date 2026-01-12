process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");

describe("Listings Routes", () => {
  it("GET /listings", async () => {
    const res = await request(app).get("/listings");
    expect(res.statusCode).toBe(200);
  });
});
