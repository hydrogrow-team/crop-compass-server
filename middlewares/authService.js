const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiError = require("../utilities/apiError");

const { SECRET_KEY } = process.env;

const authService = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists and get it
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("Please log in to perform this action", 401));
  }

  // Verify token and decode it
  const decoded = jwt.verify(token, SECRET_KEY);
  const { id } = decoded;

  // User authentication logic
  let currentUser = await User.findById(id).select({ password: 0 });

  // Check if user exists
  if (!currentUser) {
    return next(new ApiError("Account not found", 401));
  }

  req.user = currentUser;
  next();
});

module.exports = authService;
