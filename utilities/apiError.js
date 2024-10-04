/* eslint-disable no-restricted-syntax */
// @desc  this class is extending Error to provide more functionality like status and statusCode
class ApiError extends Error {
  constructor(message, statusCode, errors) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    if (errors !== undefined) {
      this.errors = errors;
    }
  }
}

module.exports = ApiError;
