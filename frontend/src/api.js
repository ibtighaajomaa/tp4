import axios from 'axios';

// On utilise 'export const api' pour qu'il puisse être importé avec des accolades { api }
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const response = await api.post('/token/', { username, password });
  localStorage.setItem('token', response.data.access);
  localStorage.setItem('refresh', response.data.refresh);
  return response.data;
};

export const getPatients = () => api.get('/patients/');
export const getObservations = (patientId) => api.get(`/observations/?patient=${patientId}`);

// On garde l'export par défaut aussi au cas où
export default api;
