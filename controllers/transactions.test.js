const request = require("supertest");
const express = require("express");
const router = require("../routes/transactions");
const { generateToken } = require("../controllers/auth");
const dotenv = require("dotenv");
const dbHandler = require("../db/test-db-handler");
const User = require("../models/user");
const Category = require("../models/category");

// include the env values so we can decode tokens
dotenv.config();

const app = new express();
app.use(express.json());

// use budgets router as our entry point /
app.use("/", router);

describe("Test Transactions Routes", function () {
  //runs before all tests in the describe block
  beforeAll(async () => {
    //connect to an in memory database to mock the real one.
    await dbHandler.connect();

    //create a user in the mock database and generate a token for it.
    mockUser = new User({
      authProvider: "google",
      authId: "1234123",
      email: "budgetTestUser@none.com",
      name: "TestUser",
      role: "user",
    });
    await mockUser.save();
    token = generateToken(mockUser);

    //create a mock category for our budget to go into
    mockCategory = new Category({
      userId: mockUser._id,
      name: "mockCategory1",
      type: "expense",
      color: "red",
    });
    await mockCategory.save();

    mockTransaction = {};
  });

  //runs after all tests in the describe block
  afterAll(async () => {
    //shutdown the mock database
    dbHandler.closeDatabase();
  });

  // test the get / route
  test("responds to get /", async () => {
    const res = await request(app)
      .get("/")
      .set("Authorization", "Bearer " + token);
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
  });

  // test the post / route
  test("responds to post /", async () => {
    data = {
      userId: mockUser._id,
      categoryId: mockCategory._id,
      amount: 111.99,
      type: "expense",
      date: "2025-01-01",
      note: "Test Transaction",
      account: "Spending Acount number 1",
    };

    const res = await request(app)
      .post("/")
      .set("Authorization", "Bearer " + token)
      .send(data);

    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //expect json and 201 to come back. Then check for a few fields in the json
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("categoryId");
    expect(res.body).toHaveProperty("createdAt");
    mockTransaction = res.body;
  });

  // test the get /:id route
  test("responds to get /:id", async () => {
    const res = await request(app)
      .get("/" + mockTransaction._id)
      .set("Authorization", "Bearer " + token);
    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //excpect json and 200 to come back
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("categoryId");
    expect(res.body).toHaveProperty("createdAt");
    expect(res.body.amount).toBe(111.99);
    expect(res.body.type).toBe("expense");
  });

  // test the put /:id route
  test("responds to put /:id", async () => {
    data = {
      userId: mockUser._id,
      categoryId: mockCategory._id,
      amount: 222.99,
      type: "expense",
      date: "2025-02-02",
      note: "Test Transaction 2",
      account: "Spending Acount number 2",
    };

    const res = await request(app)
      .put("/" + mockTransaction._id)
      .set("Authorization", "Bearer " + token)
      .send(data);

    if (Object.hasOwn(res.body, "error")) {
      console.log(res.body);
    }
    //expect json and 201 to come back. Then check for a few fields in the json
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("categoryId");
    expect(res.body).toHaveProperty("createdAt");
    expect(res.body.amount).toBe(222.99);
    expect(res.body.date).toBe("2025-02-02T00:00:00.000Z");
    expect(res.body.account).toBe("Spending Acount number 2");
    expect(res.body.note).toBe("Test Transaction 2");
    expect(JSON.stringify(res.body.userId)).toEqual(
      JSON.stringify(mockUser._id)
    );
    expect(JSON.stringify(res.body.categoryId)).toEqual(
      JSON.stringify(mockCategory._id)
    );
    
  });

  // test the delete /:id route
  
    test("responds to delete /:id", async () => {
      const res = await request(app)
        .delete("/" + mockTransaction._id)
        .set("Authorization", "Bearer " + token);
      if (Object.hasOwn(res.body, "error")) {
        console.log(res.body);
      }
  
      //excpect json and 200 to come back
      expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Transaction deleted successfully");
    });

});
