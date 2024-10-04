function convertToGeo(coords) {
  const lat = parseFloat(coords.lat);
  const lon = parseFloat(coords.lon);

  // Define a small range to create a square polygon around the point
  const delta = 0.01; // Adjust this value to increase or decrease the size of the polygon

  return {
    type: "Polygon",
    coordinates: [
      [
        [lon - delta, lat - delta], // Bottom left
        [lon + delta, lat - delta], // Bottom right
        [lon + delta, lat + delta], // Top right
        [lon - delta, lat + delta], // Top left
        [lon - delta, lat - delta], // Closing the polygon
      ],
    ],
  };
}

module.exports = convertToGeo;
