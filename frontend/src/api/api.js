import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

 
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }


        if (!originalRequest.url.includes('/login/')) {
          const response = await axios.post('http://localhost:8000/api/users/token/refresh/', {
            refresh: refreshToken,
          });
            
          const { access } = response.data;
          localStorage.setItem('access_token', access);
            

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {

        if (!originalRequest.url.includes('/login/')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);


export const authAPI = {
  register: (userData) => api.post('/users/register/', userData),
  login: (credentials) => api.post('/users/login/', credentials),
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await api.post('/users/logout/', { refresh: refreshToken });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
  getSubscriptionPlans: () => api.get('/users/subscription-plans/'),
  createSubscription: (data) => api.post('/users/subscriptions/', data),
  refreshToken: (refreshToken) => 
    api.post('/users/token/refresh/', { refresh: refreshToken }),
};

export default api;