const express = require("express");

const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const helmet = require("helmet");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const postRouter = require("./routes/postRouters.js");
const dirRouter = require("./routes/dirRouters.js");
const userRouter = require("./routes/userRouters.js");
const postLanCollectionRouter = require("./routes/postLanCollectionRouters.js");

const AppError = require("./Utils/appError.js");
const globalErrorhandler = require("./controllers/errorController.js");

const app = express();

app.use(express.json({ limit: "10mb" })); // 设置请求体限制为10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.set("trust proxy", 1);

app.use(express.json());

app.use(cookieParser());

// Data sanitization against NoSQL query injection.
app.use(ExpressMongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["topic", "page", "limit", "secondTopic"],
  })
);

// Serving static files

// only compression the text that is sent to clients, So its not going to be working for images, because image are usually already compressed
app.use(compression());

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
  max: 60,
  windowMs: 60 * 1000, //timeWindow
  message: "Too many requests from this IP, please try again in an hour",
  keyGenerator: (req, res) => {
    if (!req.ip) {
      console.error("Warning: req.ip is missing!");
      return req.socket.remoteAddress;
    }
    return req.ip.replace(/:\d+[^:]*$/, "");
  },
});
app.use(limiter);

app.use(function (req, res, next) {
  console.log("originalIp -> ", req.ip);
  next(); // 继续执行下一个中间件或路由处理程序
});

app.use(express.static(path.join(__dirname, "build")));
// app.get("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.get("/ip", (request, response) => response.send(request.ip));
app.get("/x-forwarded-for", (request, response) =>
  response.send(request.headers["x-forwarded-for"])
);

app.use("/:lan/api/post", postRouter);
app.use("/:lan/api/dir", dirRouter);
app.use("/:lan/api/postLanCollection", postLanCollectionRouter);
app.use("/:lan/api/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server...😢`, 404));
});

app.use(globalErrorhandler);

module.exports = app;
