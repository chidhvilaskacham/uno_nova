import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Refresh token failed, redirect to login or clear state
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
