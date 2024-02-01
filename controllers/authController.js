const jwt = require("jsonwebtoken");
const catchAsync = require("../Utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../Utils/appError");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  console.log("this is token -> ", token);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // domain: req.get("host"),

    httpOnly: true,
    sameSite: "none",
    secure:
      process.env.NODE_ENV === "development"
        ? true
        : req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  user.password = undefined;

  // console.log(res);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure:
      process.env.NODE_ENV === "development"
        ? true
        : req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(200).json({
    status: "success",
  });
};

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.headers);
  // console.log(req.cookies);
  // if (!req.cookies) {
  //   return next();
  // }
  // console.log(req.cookies.jwt, process.env.JWT_SECRET);
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const CurrentUser = await User.findById(decoded.id);

      console.log(CurrentUser);
      if (!CurrentUser) {
        return next();
      }
      if (CurrentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = CurrentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You dont have permission..."), 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const CurrentUser = await User.findById(decoded.id);

  if (!CurrentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist.")
    );
  }

  if (CurrentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("Password changed. please log in again.", 401));
  }

  req.user = CurrentUser;
  res.locals.user = CurrentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log("role->", req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You dont have permission to perform this action.", 403)
      );
    }
    next();
  };
};

exports.whoami = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You dont have permission..."), 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  console.log(user);

  res.status(200).json({
    role: user.role,
  });
});
