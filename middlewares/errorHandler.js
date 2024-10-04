const mongoose = require("mongoose");
const ApiError = require("../utilities/apiError");

//@desc  Receives the ApiError object returned from the class in the (err, ...) parameter and sends response
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "JsonWebTokenError") {
    err = new ApiError("Invalid token, please log in", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new ApiError("Token expired, please log in", 401);
  }

  if (err instanceof mongoose.Error.CastError) {
    err = new ApiError("Invalid ID", 400);
  }

  // Duplicated error handling
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    let message = "";
    if (key === "email") {
      message = "Email is already in use";
    }
    err = new ApiError("Invalid data", 400, [
      {
        type: "duplicated error",
        message: message,
        path: key,
      },
    ]);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errorsArray = [];
    Object.values(err.errors).forEach((error) => {
      errorsArray.push({
        path: error.path || error.properties.path,
        message: error.message || error.properties.message,
        type: error.type || error.name,
      });
    });
    err = new ApiError("Invalid data", 400, errorsArray);
  }

  // Sending the error response
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      error: err,
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      error: err,
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
    });
  }
};

module.exports = globalError;
