// src/api/disruption.js
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/predict_disruption";

export const getDisruptionPrediction = async (inputData) => {
  try {
    const res = await axios.post(API_URL, inputData);
    return res.data; // { disruption: 1, probability: 0.82 }
  } catch (error) {
    console.error("Error fetching disruption prediction:", error);
    return null;
  }
};
