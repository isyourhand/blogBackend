const app = require("./app.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const db = process.env.DATABASE;

mongoose.connect(db).then(() => {
  console.log("MongoDb Connection Successful.");
});

const port = 4000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
