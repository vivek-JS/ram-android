import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1/", // Replace with your base URL
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});
export default axiosInstance;
