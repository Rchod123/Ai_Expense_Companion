import axios from 'axios';
import Device from '../Config';

export const API_BASE_URL = Device.isAndroid ? 'http://10.0.2.2:5001/api/v1' : 'http://localhost:5001/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const setAccessToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};
