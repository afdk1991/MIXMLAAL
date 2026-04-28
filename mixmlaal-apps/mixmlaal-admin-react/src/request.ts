import { RequestOptionsInit } from 'umi-request';

const API_BASE_URL = 'http://localhost:8081/api';

export const requestConfig: RequestOptionsInit = {
  prefix: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  errorHandler: (error: any) => {
    const { response } = error;
    if (response) {
      const { status, statusText } = response;
      console.error('Request error:', status, statusText);
    } else {
      console.error('Network error');
    }
    throw error;
  },
};

export const requestInterceptors = [
  (url: string, options: RequestOptionsInit) => {
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return { url, options };
  },
];
