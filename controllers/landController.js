const asyncHandler = require("express-async-handler");
const ApiError = require("../utilities/apiError");
const { default: axios } = require("axios");
const simplifySoilgrids = require("../utilities/simplifySoilgrids");
const convertToGeo = require("../utilities/convertToGeo");

function getCurrentDate(type) {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = today.getFullYear() - 1;
  if (type === "weather") {
    return `${yyyy}-${mm}-${dd}`;
  } else if (type === "rainfall") {
    return `${mm}/${dd}/${yyyy}`;
  }
}

// Function to get the date 30 days from today
function getDate30DaysLater(type) {
  const today = new Date();
  const laterDate = new Date(today);
  laterDate.setDate(today.getDate() + 5); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!//
  const dd = String(laterDate.getDate()).padStart(2, "0");
  const mm = String(laterDate.getMonth() + 1).padStart(2, "0");
  const yyyy = laterDate.getFullYear() - 1;
  if (type === "weather") {
    return `${yyyy}-${mm}-${dd}`;
  } else if (type === "rainfall") {
    return `${mm}/${dd}/${yyyy}`;
  }
}

module.exports = {
  // * @desc get land data from APIs using lat and long
  // * @route POST /api/v1/land/soilgrids
  // ! @access Public

  getSoilgrids: asyncHandler(async (req, res, next) => {
    let { lat, lon } = req.query;
    lat = parseFloat(lat).toFixed(0);
    lon = parseFloat(lon).toFixed(0);
    const Soilgrids = await axios.get(
      `https://dev-rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=sand&property=cec&property=nitrogen&property=phh2o&property=soc&value=mean&depth=5-15cm`
    );

    let SoilgridsData = simplifySoilgrids(Soilgrids.data);

    return res.status(201).json({
      success: true,
      message: "Data fetched successfully",
      data: {
        ...SoilgridsData,
      },
    });
  }),

  // -------------------------------------------------------------------------------------------------------------------------- //
  // * @desc get land data from APIs using lat and long
  // * @route POST /api/v1/land/rainfall
  // ! @access Public
  getRainfall: asyncHandler(async (req, res, next) => {
    const { lat, lon } = req.query;

    let geoCoordinates = JSON.stringify(convertToGeo({ lat, lon }));
    const begintime = getCurrentDate("rainfall"); // Today's date
    const endtime = getDate30DaysLater("rainfall"); // Date 30 days from today

    const climateServReq = await axios.get(
      `https://climateserv.servirglobal.net/api/submitDataRequest/?datatype=0&begintime=${begintime}&endtime=${endtime}&intervaltype=0&operationtype=5&geometry=${geoCoordinates}&isZip_CurrentDataType=false`
    );

    const climateServReqId = climateServReq.data[0];
    while (true) {
      let climateServStatus = await axios.get(
        `https://climateserv.servirglobal.net/api/getDataRequestProgress/?id=${climateServReqId}`
      );

      if (climateServStatus.data[0] === 100) {
        break;
      }
    }
    const climateServRes = await axios.get(
      `https://climateserv.servirglobal.net/api/getDataFromRequest/?id=${climateServReqId}`
    );
    let climateServData = climateServRes.data;
    const { totalRainfall } = climateServData.data.reduce(
      (acc, dayData) => {
        const rainfall = dayData.value.avg; // Extract the avg value for each day

        // Increment total rainfall and day count
        acc.totalRainfall += rainfall;

        return acc;
      },
      { totalRainfall: 0 } // Initial values for reduce
    );

    // Calculate the average by dividing the total rainfall by the number of days

    climateServData.total = totalRainfall;

    return res.status(201).json({
      success: true,
      message: "Data fetched successfully",
      data: {
        SoilgridsData,
        climateServData,
      },
    });
  }),

  // -------------------------------------------------------------------------------------------------------------------------- //

  // * @desc get land data from APIs using lat and long
  // * @route POST /api/v1/land/weather
  // ! @access Public

  getWeather: asyncHandler(async (req, res, next) => {
    const { lat, lon } = req.query;

    const begintime = getCurrentDate("weather"); // Today's date
    const endtime = getDate30DaysLater("weather"); // Date 30 days from today
    console.log(begintime, endtime);
    const weatherData = await axios.get(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/2023-10-01/2023-10-10?key=${process.env.WEATHER_API_KEY}&include=days`
    );

    return res.status(201).json({
      success: true,
      message: "Data fetched successfully",
      data: {
        ...weatherData.data,
      },
    });
  }),

  // -------------------------------------------------------------------------------------------------------------------------- //
};
