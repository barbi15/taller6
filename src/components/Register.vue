<template>
  <div class="register-container">
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Nombre de Usuario:</label>
        <input type="text" v-model="name" required placeholder="Ingresa tu nombre de usuario" />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required placeholder="Ingresa tu correo electrónico" />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" v-model="password" required placeholder="Ingresa tu contraseña" />
      </div>
      <button type="submit">Registrar</button>
    </form>
    <p>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
    <!-- Mensaje de error o éxito -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
// Importar la función de registro desde auth.js
import { register } from '../auth';

export default {
  data() {
    return {
      name: '', // Campo de nombre de usuario
      email: '', // Campo de correo electrónico
      password: '', // Campo de contraseña
      errorMessage: '', // Mensaje de error
      successMessage: '', // Mensaje de éxito
    };
  },
  methods: {
    async handleRegister() {
      // Llamar a la función de registro con los datos requeridos
      const response = await register({
        nombre_usuario: this.name,
        correo: this.email,
        contrasena: this.password,
      });

      if (response.success) {
        // Si el registro fue exitoso, mostrar un mensaje de éxito y redirigir al login
        this.successMessage = 'Registro exitoso. Redirigiendo a la pantalla de inicio de sesión...';
        setTimeout(() => {
          this.$router.push('/login'); // Redirigir después de 2 segundos
        }, 2000);
      } else {
        // Mostrar el mensaje de error específico si la solicitud falla
        this.errorMessage = `Error en el registro: ${response.message} (Código: ${response.statusCode})`;
        this.successMessage = ''; // Limpiar el mensaje de éxito
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #38a169;
}

select, input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  color: red;
  margin-top: 15px;
}

.success {
  color: green;
  margin-top: 15px;
}
</style>
