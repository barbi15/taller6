<template>
    
    <div class="fondlog-cont">

  <div class="login1-container">
    <h1 class="login-title">Rotiseria La Triada</h1>
   
    <div class="logo-container">
      <img src='../images/logorotiseria.png' alt="Logo" id="logo">
    </div>
    
    <form @submit.prevent="handleLogin"> 
      <div class="input-group">
        <label for="username">Usuario</label>
        <input type="text" id="username" v-model="username" required placeholder="Usuario"/>
      </div>
      <div class="input-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" v-model="password" required placeholder="Contraseña" />
      </div>
      <div class="inicio">
        <button type="submit">Iniciar Sesión</button>
      </div>
    </form>
    <p>¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
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
        const response = await axios.post('https://taller6-alejo.onrender.com/login', {
          nombre_usuario: username.value,
          contrasena: password.value
        });

        if (response.data && response.data.token) {
          const { token, id: userId } = response.data;

          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);
          configureAxiosToken(token);

          // Verifica el rol y redirige según el nombre de usuario
          if (username.value.toLowerCase().includes('admin')) {
            router.push('/Adminhome');
          } else {
            router.push('/CocineroHome');
          }
        } else {
          errorMessage.value = 'Credenciales incorrectas.';
        }
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        errorMessage.value = error.response?.data?.message || 'Error de conexión. Por favor, intenta de nuevo.';
      }
    };

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
