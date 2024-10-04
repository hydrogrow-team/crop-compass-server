const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please add an email address"],
      unique: true,
      trim: true,
      validate: [
        {
          validator: isEmail,
          message: "Invalid email address",
        },
      ],
    },
    number: {
      type: String,
      required: [true, "Please enter a valid phone number"],
      validate: [
        {
          validator: function (value) {
            // Validation for phone number (should be 11 digits, starting with "01")
            return /^01\d{9}$/.test(value);
          },
          message: "Please enter a valid phone number",
        },
        {
          // Validation to ensure the phone number doesn't match studentNumber
          validator: function (value) {
            return value !== this.studentNumber;
          },
          message:
            "Parent's phone number must be different from the student's phone number",
        },
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please add a password"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Before saving the user to the database, hash the password using bcrypt
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("user", userSchema);

module.exports = User;
