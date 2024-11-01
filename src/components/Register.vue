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

      <!-- Mensaje de validación de longitud de contraseña -->
      <p v-if="passwordError" class="error">{{ passwordError }}</p>

      <button type="submit">Registrar</button>
    </form>
    <p>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>

    <!-- Mensaje de error o éxito -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import '../styles/Registro.css';
import { register } from '../auth';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      errorMessage: '',
      successMessage: '',
      passwordError: '', // Mensaje de error para la validación de la contraseña
    };
  },
  methods: {
    async handleRegister() {
      // Validar que la contraseña tenga al menos 8 caracteres
      if (this.password.length < 8) {
        this.passwordError = 'La contraseña debe tener al menos 8 caracteres.';
        return;
      }

      // Limpiar el mensaje de error si la contraseña es válida
      this.passwordError = '';

      // Llamar a la función de registro con los datos requeridos
      const response = await register({
        nombre_usuario: this.name,
        correo: this.email,
        contrasena: this.password,
      });

      if (response.success) {
        this.successMessage = 'Registro exitoso. Redirigiendo a la pantalla de inicio de sesión...';
        // Redirigir según el tipo de usuario
        setTimeout(() => {
          if (this.name.toLowerCase().includes('admin') || this.name.toLowerCase().includes('administrador')) {
            this.$router.push('/adminhome');
          } else {
            this.$router.push('/cocinerohome');
          }
        }, 2000);
      } else {
        this.errorMessage = `Error en el registro: ${response.message} (Código: ${response.statusCode})`;
        this.successMessage = ''; // Limpiar el mensaje de éxito
      }
    },
  },
};
</script>
