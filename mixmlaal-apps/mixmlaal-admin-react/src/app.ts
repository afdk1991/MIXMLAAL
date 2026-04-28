import { RuntimeConfig } from '@umijs/max';

export const request: RuntimeConfig['request'] = {
  timeout: 10000,
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
  requestInterceptors: [
    (url: string, options: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { url, options };
    },
  ],
  responseInterceptors: [
    (response: Response) => {
      return response;
    },
  ],
};
