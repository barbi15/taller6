<template>
  <div class="login-container">
    <h1>Iniciar Sesión</h1>
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
import { login } from '../auth'; // Asegúrate de que auth.js tiene la función de login

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
      const response = await login({
        nombre_usuario: this.username,
        contrasena: this.password,
      });

      if (response.success) {
        const token = response.data.token;
        const userId = response.data.id; // Obtener el ID del usuario
        const rol = response.data.rol; // Obtén el rol si lo tienes definido
        console.log("ID de usuario:", userId);
        // Almacena en localStorage el ID del usuario y el token
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('rol', rol);

        // Redirigir según el ID del usuario
        if (userId === 1) {
          this.$router.push('/adminhome'); // Si el ID es 1, es administrador
        } else {
          this.$router.push('/cocinero'); // Si no, redirigir a la vista del cocinero
        }
      } else {
        this.errorMessage = `Error en el inicio de sesión: ${response.message} (Código: ${response.statusCode})`;
      }
    },
  },
};
</script>
