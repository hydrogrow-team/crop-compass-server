const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

//config reading dotenv configuration before using
dotenv.config({ path: path.join(__dirname, ".env") });

const connecTotDb = require("./utilities/connectToDb");
const ApiError = require("./utilities/apiError");
const globalError = require("./middlewares/errorHandler");

//routes imports
const userRouter = require("./routers/userRouter");

const app = express();

// middlewares
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));
// Enable other domains to access the api
const allowedOrigins = "*";
app.use(cors({ origin: allowedOrigins }));
// connect to MONGODB
connecTotDb();

//Routes
app.use("/api/v1/user", userRouter);

app.get("/test", async (req, res) => {
  res.status(200).send("Tested Successfully");
});

// error handling for unkown routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
});

//error handling middlewares
app.use(globalError);

// test route to check status

const port = process.env.PORT;
const server = app.listen(port || 3300, () => {
  console.log(
    "Server Is Running! \n" +
      `➜ Mode: ${process.env.NODE_ENV} \n` +
      `➜ Local:  http://localhost:${port} \n`
  );
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
