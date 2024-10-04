const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const createToken = require("../utilities/createToken");
const User = require("../models/userModel");
const ApiError = require("../utilities/apiError");

module.exports = {
  // * @desc creates a new user in the database
  // * @route POST /api/v1/user/register
  // ! @access Public

  createUser: asyncHandler(async (req, res, next) => {
    const user = await User.create({
      email: req.body.email,
      number: req.body.number,
      password: req.body.password,
    });
    if (!user) {
      return next(
        new ApiError("An error occurred, please try registering again", 500)
      );
    }
    const loginToken = createToken({ id: user._id });

    const userData = user.toObject();
    userData.loginToken = loginToken;
    delete userData.password;

    return res.status(201).json({
      success: true,
      message: "Your account has been successfully registered",
      data: {
        user: userData,
      },
    });
  }),

  // ---------------------------------------------------------------------------------------------------------- //
  // * @desc login a user
  // * @route POST /api/v1/user/login
  // ! @access Public

  userLogin: asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ApiError("Please provide email and password", 400));
    }
    const user = await User.findOne({ email: email });

    if (!user) {
      return next(
        new ApiError("This email is not registered on the platform", 404, [
          {
            message: "This email is not registered on the platform",
            path: "email",
            value: email,
            type: "unfound email failed",
          },
        ])
      );
    }

    const passwordMatch = await bcrypt.compare(
      password.toString(),
      user.password
    );

    if (!passwordMatch) {
      return next(
        new ApiError("Incorrect password", 401, [
          {
            message: "Incorrect password",
            path: "password",
            value: password,
            type: "password match failed",
          },
        ])
      );
    }

    const loginToken = createToken({ id: user._id });

    const updatedUser = await User.findById(user._id).select({
      password: 0,
    });

    const userData = updatedUser.toObject();
    userData.loginToken = loginToken;

    return res.status(200).json({
      data: { user: userData },
      success: true,
      message: "You have successfully logged in to your account",
    });
  }),
  // ---------------------------------------------------------------------------------------------------------- //
  // * @des send user information
  // * @route GET /api/v1/user/:id
  // ! @access Public

  getUserInfo: asyncHandler(async (req, res, next) => {
    const { user } = req;

    return res.status(200).json({
      success: true,
      message: "",
      data: {
        user: user,
      },
    });
  }),
  // ---------------------------------------------------------------------------------------------------------- //
  // * @desc update specific user properties
  // * @route PUT /api/v1/user/:id
  // ! @access Private
  updateUser: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userData = {
      email: req.body.email,
      number: req.body.number,
    };
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: userData,
    }).select({ password: 0 });

    if (!updatedUser) {
      return next(new ApiError(`No user found with this ID (${id})`, 404));
    }
    return res.status(200).json({
      success: true,
      message: `User data has been successfully updated`,
      data: {
        user: updatedUser,
      },
    });
  }),
  // ---------------------------------------------------------------------------------------------------------- //

  // * @desc update specific user password
  // * @route PATCH /api/v1/user/change-password/:id
  // ! @access Private
  updatePassword: asyncHandler(async (req, res, next) => {
    const { password } = req.body;
    const { id } = req.params;
    if (password.length < 8) {
      return next(
        new ApiError("Password must be at least 8 characters long", 400)
      );
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      {
        new: true,
        runValidators: true,
      }
    ).select({ password: 0 });
    if (!updatedUser) {
      return next(new ApiError(`No user found with this ID (${id})`, 404));
    }
    return res.status(200).json({
      success: true,
      message: `Password has been successfully updated`,
      data: {},
    });
  }),
  // ---------------------------------------------------------------------------------------------------------- //
  // * @desc delete specific user from DB
  // * @route DELETE /api/v1/user/:id
  // ! @access Private
  deleteUser: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id).select({
      password: 0,
      passwordChangedAt: 0,
    });
    if (!deletedUser) {
      return next(new ApiError(`No user found with this ID (${id})`, 404));
    }
    return res.status(200).json({
      success: true,
      message: `User has been successfully deleted`,
      data: {},
    });
  }),
};
