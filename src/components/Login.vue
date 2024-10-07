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

        // Redirigir siempre a la pantalla del administrador (AdminHome)
        this.$router.push('/adminhome');

        // Código comentado para redirigir a la pantalla del cocinero
        /*
        if (userId === 1) {
          this.$router.push('/adminhome'); // Si el ID es 1, es administrador
        } else {
          this.$router.push('/cocinero'); // Si no, redirigir a la vista del cocinero
        }
        */
      } else {
        // Mostrar mensaje de error si el inicio de sesión falla
        this.errorMessage = `Error en el inicio de sesión: ${response.message} (Código: ${response.statusCode})`;
      }
    },
  },
};
</script>

<style scoped>
/* Estilos personalizados para la pantalla de login */
.login-container {
  width: 300px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button[type="submit"] {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  border: none;
  color: white;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #2980b9;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
