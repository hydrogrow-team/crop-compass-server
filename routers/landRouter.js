const landRouter = require("express").Router();
const landController = require("../controllers/landController");

landRouter.get("/soilgrids", landController.getSoilgrids);
landRouter.get("/rainfall", landController.getRainfall);
landRouter.get("/weather", landController.getWeather);

module.exports = landRouter;
