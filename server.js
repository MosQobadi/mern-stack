const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// validate userID
const validObjectIdRegex = /^[0-9a-fA-F]{24}$/;

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb://0.0.0.0:27017";
const client = new MongoClient(uri);

app.get("/", (req, res) => {
  res.send("Hello from the backend server!");
});

app.get("/api/users", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("panel");
    const collection = database.collection("users");

    const users = await collection.find().toArray();
    console.log(users);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, lastName, email, firstName, password } = req.body;

    await client.connect();
    const database = client.db("panel");
    const collection = database.collection("users");

    const existingUser = await collection.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists." });
    }

    const newUser = {
      username: username,
      lastName: lastName,
      email: email,
      firstName: firstName,
      password: password,
    };

    await collection.insertOne(newUser);
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
  }
});

app.delete("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    console.log("User ID:", userId); // Add this console log statement to verify the userId

    if (!validObjectIdRegex.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    await client.connect();
    const database = client.db("panel");
    const collection = database.collection("users");

    const result = await collection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
});

const port = 3000;

mongoose.connect(uri);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
