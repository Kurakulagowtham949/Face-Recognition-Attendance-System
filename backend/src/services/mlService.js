import axios from "axios";

const client = axios.create({
  baseURL: process.env.ML_SERVICE_URL || "http://localhost:8000",
  timeout: 10000
});

export const registerFace = async ({ userId, imageBase64 }) => {
  const response = await client.post("/register-face", { userId, imageBase64 });
  return response.data;
};

export const recognizeFace = async (imageBase64) => {
  const response = await client.post("/recognize", { imageBase64 });
  return response.data;
};
