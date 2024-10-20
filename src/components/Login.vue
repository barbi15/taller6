<template>
  <link rel="stylesheet" href="styles/estilo1nar.css">
  <div class="login-container">
    <!-- Título de la Rotisería -->
    <h1>INICIO DE SESION</h1>

    <!-- Contenedor del logo -->
    <div class="logo-container">
      <!-- Aquí puedes agregar tu logo -->
      <img src='../images/logoiniciosesion.png' alt="Logo" id="logo">
    </div>
    <!-- Formulario de inicio de sesión -->
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
import '../styles/Estilo1.css';
import { login } from '../auth';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const handleLogin = async () => {
      try {
        const response = await login({
          nombre_usuario: username.value,
          contrasena: password.value,
        });

        if (response.success) {
          const { token, id: userId } = response.data;
          
          console.log('User ID guardado:', userId);
          
          // Almacenar el ID del usuario y el token en el localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);

          // Configurar el token para futuras solicitudes
          configureAxiosToken(token);

          // Redirigir al usuario
          router.push('/Adminhome');
        } else {
          errorMessage.value = `Error en el inicio de sesión: ${response.message}`;
        }
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        errorMessage.value = 'Error de conexión. Por favor, intenta de nuevo.';
      }
    };

    // Función para configurar el token en Axios
    const configureAxiosToken = (token) => {
      // Asumiendo que estás usando Axios
      import('axios').then(axios => {
        axios.default.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      });
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