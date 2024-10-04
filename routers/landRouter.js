const landRouter = require("express").Router();
const landController = require("../controllers/landController");

landRouter.get("/soilgrids", landController.getSoilgrids);

module.exports = landRouter;
