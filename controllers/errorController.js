const sendErrorDev = (err, req, res) => {
  console.log("ERROR- 😀🤣", err);

  console.log("error occur, try to response...");

  console.log(req.originalUrl);

  if (
    req.originalUrl.startsWith(`/cn/api`) ||
    req.originalUrl.startsWith("/en/api")
  ) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorDev(err, req, res);
  }
};
