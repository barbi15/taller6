<template> 
  <div class="register-container">
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Usuario:</label>
        <input type="text" v-model="name" required placeholder="Nombre de usuario" />
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required placeholder="Correo electrónico" />
      </div>
      <div class="form-group">
        <label>Contraseña:</label>
        <input type="password" v-model="password" required placeholder="Contraseña" />
      </div>
      <p v-if="passwordError" class="error">{{ passwordError }}</p>
      <button type="submit">Registrar</button>
    </form>
    <p>¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      errorMessage: '',
      successMessage: '',
      passwordError: '',
    };
  },
  methods: {
    async handleRegister() {
      if (this.password.length < 8) {
        this.passwordError = 'La contraseña debe tener al menos 8 caracteres.';
        return;
      }
      this.passwordError = '';

      try {
        // Llamar al endpoint de registro y recibir directamente el token en la respuesta
        const registerResponse = await axios.post('https://taller6-alejo.onrender.com/usuarios', {
          nombre_usuario: this.name,
          correo: this.email,
          contrasena: this.password,
        });

        if (registerResponse.data.token) {
          const token = registerResponse.data.token;

          // Guardar el token en localStorage
          localStorage.setItem('token', token);

          this.successMessage = 'Registro exitoso. Redirigiendo...';

          // Redirigir según el tipo de usuario
          if (this.name.toLowerCase().includes('admin')) {
            this.$router.push('/adminhome');
          } else {
            this.$router.push('/cocinerohome');
          }
        } else {
          this.errorMessage = `Error en el registro: ${registerResponse.data.message}`;
        }
      } catch (error) {
        console.error("Error en el registro:", error);
        this.errorMessage = `Hubo un error: ${error.response?.data?.message || error.message || 'Error desconocido'}`;
        this.successMessage = '';
      }
    },
  },
};
</script>
