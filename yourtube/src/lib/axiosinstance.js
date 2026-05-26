import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

axiosInstance.interceptors.request.use((config) => {
  console.log(`AXIO_REQ: ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`);
  return config;
}, (error) => {
  console.error("AXIO_REQ_ERR:", error);
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  console.log(`AXIO_RES: ${response.status} from ${response.config.url}`);
  return response;
}, (error) => {
  console.error("AXIO_RES_ERR:", error.response?.status, error.message);
  return Promise.reject(error);
});

export default axiosInstance;
