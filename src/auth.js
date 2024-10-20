// auth.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://taller6-alejo.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Esto habilita el envío de credenciales
});

// Función de registro de usuarios
const register = async (data) => {
  try {
    const response = await api.post('/usuarios', data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

// Función de inicio de sesión (login)
// (modificado para almacenar el token)
const login = async (data) => {
  try {
    const response = await api.post('/login', data); 
    const token = response.data.token; // Asegúrate de que el backend te devuelve el token
    localStorage.setItem('token', token); // Guardar token en localStorage
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

// Función para obtener el token
const getToken = () => {
  return localStorage.getItem('token');
};

// Manejo de errores centralizado
function handleError(error) {
  if (error.response) {
    const statusCode = error.response.status;
    const message = error.response.data.message || 'Error en la solicitud';
    return { success: false, statusCode, message };
  }
  return { success: false, message: 'Error de red o de configuración.' };
}

// Exportar las funciones que se utilizan en los componentes
export { register, login, getToken }; //