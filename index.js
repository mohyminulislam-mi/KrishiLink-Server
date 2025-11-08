// Import dependencies
const express = require("express");
const cors = require("cors");

// Create app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

//default route
app.get("/", (req, res) => {
  res.send("Your server is ready");
});

// Start server
app.listen(port, () => {
  console.log(`Server running : ${port}`);
});
