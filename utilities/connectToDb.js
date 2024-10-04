const mongoose = require("mongoose");

const { MONGODB_URI } = process.env;

const connecTotDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      //  useNewUrlParser: true,
      //  useUnifiedTopology: true,
    });
    console.log("Connected to the DB successfully");
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
};

module.exports = connecTotDb;
