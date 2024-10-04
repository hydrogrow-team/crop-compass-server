const landRouter = require("express").Router();
const landController = require("../controllers/landController");

landRouter.get("/data", landController.getLandData);

module.exports = landRouter;
