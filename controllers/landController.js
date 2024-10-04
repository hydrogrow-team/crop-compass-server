const asyncHandler = require("express-async-handler");
const ApiError = require("../utilities/apiError");
const { default: axios } = require("axios");
const simplifySoilgrids = require("../utilities/simplifySoilgrids");
const convertToGeo = require("../utilities/convertToGeo");

function getCurrentDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = today.getFullYear() - 1;
  return `${mm}/${dd}/${yyyy}`;
}

// Function to get the date 30 days from today
function getDate30DaysLater() {
  const today = new Date();
  const laterDate = new Date(today);
  laterDate.setDate(today.getDate() + 30);
  const dd = String(laterDate.getDate()).padStart(2, "0");
  const mm = String(laterDate.getMonth() + 1).padStart(2, "0");
  const yyyy = laterDate.getFullYear() - 1;
  return `${mm}/${dd}/${yyyy}`;
}

module.exports = {
  // * @desc get land data from APIs using lat and long
  // * @route POST /api/v1/land/data
  // ! @access Public

  getLandData: asyncHandler(async (req, res, next) => {
    const { lat, lon } = req.query;

    const Soilgrids = await axios.get(
      `https://dev-rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=cec&property=nitrogen&property=phh2o&property=soc&value=mean&value=Q0.05&value=Q0.95`
    );
    let SoilgridsData = simplifySoilgrids(Soilgrids.data);
    // ---------------- //
    let geoCoordinates = JSON.stringify(convertToGeo({ lat, lon }));
    const begintime = getCurrentDate(); // Today's date
    const endtime = getDate30DaysLater(); // Date 30 days from today

    console.log(begintime + " " + endtime);

    const climateServReq = await axios.get(
      `https://climateserv.servirglobal.net/api/submitDataRequest/?datatype=0&begintime=${begintime}&endtime=${endtime}&intervaltype=0&operationtype=5&geometry=${geoCoordinates}&isZip_CurrentDataType=false`
    );

    const climateServReqId = climateServReq.data[0];
    while (true) {
      let climateServStatus = await axios.get(
        `https://climateserv.servirglobal.net/api/getDataRequestProgress/?id=${climateServReqId}`
      );
      console.log(climateServStatus.data[0]);
      console.log(typeof climateServStatus.data[0]);
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

    // const tempsDataReq = await axios.get(
    //   `https://api.open-meteo.com/v1/forecast?latitude=${lon}&longitude=${lat}&daily=temperature_2m_max&forecast_days=16`
    // );
    // Object.fromEntries = (arr) =>
    //   Object.assign({}, ...Array.from(arr, ([k, v]) => ({ [k]: v })));

    // let tempsData = Object.fromEntries(
    //   tempsDataReq.data.daily.temperature_2m_max.map((day, index) => {
    //     return [index, day];
    //   })
    // );
    // console.log(tempsData);

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
};
