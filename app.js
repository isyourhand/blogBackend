const express = require("express");

const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const postRouter = require("./routes/postRouters.js");
const dirRouter = require("./routes/dirRouters.js");
const userRouter = require("./routes/userRouters.js");
const postLanCollectionRouter = require("./routes/postLanCollectionRouters.js");

const AppError = require("./Utils/appError.js");
const globalErrorhandler = require("./controllers/errorController.js");

const app = express();

app.use(express.json({ limit: "10mb" })); // 设置请求体限制为10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.enable("trust proxy");

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: function (requestOrigin, callback) {
      console.log("OriginUrl -> ", requestOrigin);
      const allowedOrigins = [
        "http://localhost:3001",
        "http://localhost:3000",
        "http://localhost:59157",
        "http://8.134.236.92:3000",
        "http://llog.top:3000/",
      ];

      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS."));
      }
    },
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.static(path.join(__dirname, "build")));
// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.use("/:lan/api/post", postRouter);
app.use("/:lan/api/dir", dirRouter);
app.use("/:lan/api/postLanCollection", postLanCollectionRouter);
app.use("/:lan/api/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server...😢`, 404));
});

app.use(globalErrorhandler);

module.exports = app;
