// Import dependencies
const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Create app
const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mohyminulislam.uwhwdlk.mongodb.net/?appName=Mohyminulislam`;

// Middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const db = client.db("krishilink_DB");
    const productCollections = db.collection("products");
    const interestCollections = db.collection("interests");

    // ---------------- products data start ----------------
    //create user data on database
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      newProduct.created_at = new Date();
      newProduct.created_at_display = dayjs().format("MMM D, YYYY h:mm A");
      const result = await productCollections.insertOne(newProduct);
      res.send(result);
    });

    // get data on database
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      console.log(email);

      const query = {};
      if (email) {
        query["owner.ownerEmail"] = email;
      }

      const cursor = productCollections.find(query).sort({ created_at: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    //get product by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);

      const query = { _id: new ObjectId(id) };
      const result = await productCollections.findOne(query);
      res.send(result);
    });
    // latest products
    app.get("/latest-products", async (req, res) => {
      const cursor = productCollections
        .find()
        .sort({ created_at: -1 })
        .limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });

    // delete data on database
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.deleteOne(query);
      res.send(result);
    });
    // update data on database
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      console.log("updateProduct", updateProduct);

      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateProduct.name,
          type: updateProduct.type,
          quantity: updateProduct.quantity,
          unit: updateProduct.unit,
          price: updateProduct.price,
          description: updateProduct.description,
          address: updateProduct.address,
          image: updateProduct.image,
        },
      };
      const result = await productCollections.updateOne(query, update);
      res.send(result);
    });
    // ---------------- interests data start ----------------
    app.post("/interests", async (req, res) => {
      const { cropId, name, email, quantity, units, message, cropTitle } =
        req.body;

      if (!cropId || !quantity) {
        return res.status(400).send({ message: "Missing required fields" });
      }
      const formattedDate = dayjs().format("MMM D, YYYY h:mm A");
      const newInterest = {
        cropId: new ObjectId(cropId),
        name,
        email,
        quantity,
        units,
        message,
        cropTitle,
        status: "pending",
        createdAt: formattedDate,
      };

      const result = await interestCollections.insertOne(newInterest);
      res.send(result);
    });
    // get all interests
    app.get("/interests", async (req, res) => {
      const cursor = interestCollections.find().sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/interests/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      try {
        const result = await interestCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: status } }
        );
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // -------------------------
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

//default route
app.get("/", (req, res) => {
  res.send("Your server is ready");
});

// Start server
app.listen(port, () => {
  console.log(`Server running : ${port}`);
});
