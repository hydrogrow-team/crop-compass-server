function simplifySoilgrids(data) {
  const result = {};

  // Iterate through each layer
  data.properties.layers.forEach((layer) => {
    const { name, unit_measure, depths } = layer;

    // Iterate through each depth
    depths.forEach((depth) => {
      const { label, values } = depth;

      // Create a key for the result object using the layer name and depth label
      const key = `${name}`;

      // Extract the mean value
      const meanValue = values.mean;

      // Structure the result
      result[key] = {
        mean: meanValue,
        unit: unit_measure.target_units,
        label: label,
      };
    });
  });

  return result;
}

module.exports = simplifySoilgrids;
