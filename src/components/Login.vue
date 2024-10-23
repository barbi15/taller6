<template>
  <link rel="stylesheet" href="styles/estilo1nar.css">
  <div class="login-container">
    <h1>INICIO DE SESION</h1>

    <div class="logo-container">
      <img src='../images/logoiniciosesion.png' alt="Logo" id="logo">
    </div>

    <form @submit.prevent="handleLogin"> 
      <div class="input-group">
        <label for="username">Usuario</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="input-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Iniciar Sesión</button>
    </form>
    <p>¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import '../styles/Estilo1.css';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const handleLogin = async () => {
      try {
        // Enviar credenciales de inicio de sesión al servidor
        const response = await axios.post('https://taller6-alejo.onrender.com/login', {
          nombre_usuario: username.value,
          contrasena: password.value
        });

        // Verificar si el inicio de sesión fue exitoso
        if (response.data && response.data.token) {
          const { token, id: userId } = response.data;

          // Almacenar el token y el ID de usuario en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);

          // Configurar Axios para incluir el token en futuras solicitudes
          configureAxiosToken(token);

          // Validar el token obtenido (no bloquear, pero mostrar advertencia si falla)
          validateToken(token);

          // Redirigir al usuario a Adminhome
          router.push('/Adminhome');
        } else {
          errorMessage.value = 'Credenciales incorrectas.';
        }
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        errorMessage.value = error.response?.data?.message || 'Error de conexión. Por favor, intenta de nuevo.';
      }
    };

    // Función para validar el token usando el endpoint /me (manejar si falla, sin bloquear)
    const validateToken = async (token) => {
      try {
        const response = await axios.get('https://taller6-alejo.onrender.com/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status !== 200) {
          console.warn('Token inválido o respuesta inesperada.');
        } else {
          console.log('Token validado correctamente');
        }
      } catch (error) {
        console.warn('Error al validar el token, pero el login es correcto:', error.response?.data || error.message);
      }
    };

    // Configurar Axios para agregar automáticamente el token en las cabeceras
    const configureAxiosToken = (token) => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    return {
      username,
      password,
      errorMessage,
      handleLogin
    };
  }
};
</script>
