const axios = require("axios");

async function detectDogType(imageBuffer) {
  const url = process.env.AZURE_OBJ_DETECT_ENDPOINT;
  const key = process.env.AZURE_OBJ_DETECT_KEY;

  try {
    const response = await axios.post(url, imageBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Prediction-Key": key,
      },
    });

    const predictions = response.data.predictions;

    if (!predictions || predictions.length === 0) {
      return false;
    }

    const bestPrediction = predictions.reduce(
      (max, p) => (p.probability > max.probability ? p : max),
      predictions[0]
    );
    console.log("Best prediction:", bestPrediction);
    return bestPrediction.tagName==="puppy" ? true : false;
  } catch (err) {

    console.error(
      "Azure object detection error:",
      err.response?.data || err.message
    );
    
    return null;
  }
}

module.exports = detectDogType;
