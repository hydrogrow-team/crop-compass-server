function simplifySoilgrids(data) {
  // Create a new object to hold the simplified data
  const simplifiedData = {};

  data.properties.layers.forEach((layer) => {
    // Filter the depths based on the specified range
    const filteredDepths = layer.depths.filter((depth) => {
      return depth.range.top_depth >= 5 && depth.range.bottom_depth <= 15;
    });

    // If there are filtered depths, store the mean value and unit in the simplifiedData object
    if (filteredDepths.length > 0) {
      const meanValue = filteredDepths[0].values.mean; // Assuming you want the mean from the first depth
      const unit = layer.unit_measure.target_units; // Accessing the unit measure

      // Use the layer name as the key
      simplifiedData[layer.name] = {
        mean: meanValue,
        unit: unit,
      };
    }
  });

  return simplifiedData;
}

module.exports = simplifySoilgrids;
