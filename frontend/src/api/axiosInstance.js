import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://taxmanager.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

export default axiosInstance;
