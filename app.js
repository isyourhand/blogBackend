const express = require("express");

const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

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
      console.log(
        "OriginUrl -> ",
        requestOrigin,
        new Date(Date.now()).toLocaleString()
      );
      const allowedOrigins = [
        "http://localhost:3001",
        "http://localhost:3000",
        "http://localhost:59157",

        "http://llog.top",
        "https://llog.top",
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

// Limit requests from same API
const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 1000, //timeWindow
  message: "Too many requests from this IP, please try again in an hour",
});
app.use(limiter);

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
