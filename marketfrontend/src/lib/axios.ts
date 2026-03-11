import axios from 'axios';
import { API_URL } from '@/helper/api';

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});