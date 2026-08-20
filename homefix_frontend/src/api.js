import axios from 'axios';

const api = axios.create {
    baseURL: 'https://homefix-backend-l33n.onrender.com/api/',
};

// The Interceptor: Automatically attaches your security token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Django expects the header to look exactly like this: "Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;