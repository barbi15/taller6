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
import '../styles/Estilo1.css';
import { login } from '../auth'; // Importar la función de login desde el archivo auth.js

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async handleLogin() {
      // Llamar a la función de login para autenticar al usuario
      const response = await login({
        nombre_usuario: this.username,
        contrasena: this.password,
      });

      if (response.success) {
        // Si el inicio de sesión es exitoso, obtener la información del usuario
        const token = response.data.token;
        const userId = response.data.id; // Obtener el ID del usuario

        // Almacenar el ID del usuario y el token en el localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);

    
        // Verifico si el usu es admin 
        if (userId === 1) {
          this.$router.push('/adminhome'); // Si el ID es 1, es administrador
        } else {
          this.$router.push('/cocinero'); // Si no, redirigir a la vista del cocinero
        }
        
      } else {
        // Mostrar mensaje de error si el inicio de sesión falla
        this.errorMessage = `Error en el inicio de sesión: ${response.message} (Código: ${response.statusCode})`;
      }
    },
  },
};
</script>