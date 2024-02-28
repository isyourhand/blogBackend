const app = require("./app.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const fs = require("fs");
const https = require("https");

dotenv.config({ path: "./.env" });

const db = process.env.DATABASE;

mongoose.connect(db).then(() => {
  console.log("MongoDb Connection Successful.");
});

const port = 4000; // 默认的HTTPS端口号为443

if (process.env.NODE_ENV === "development") {
  const hostName =
    process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0";
  console.log(hostName);

  const server = app.listen(port, hostName, () => {
    console.log(`App running on port ${port}...`);
  });
} else {
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/llog.top/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/llog.top/fullchain.pem"),
  };

  const server = https.createServer(options, app);

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
