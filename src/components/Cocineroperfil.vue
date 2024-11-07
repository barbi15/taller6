<template>
  <div class="fondo-cont">
  <div class="cook-profile">
    <h2>Perfil del Cocinero</h2>

    <!-- Campo de Usuario (solo lectura) -->
    <div class="form1-group">
      <label>Usuario</label>
      <p>{{ cookData.nombre_usuario }}</p>
    </div>

    <!-- Correo Electrónico (solo lectura) -->
    <div class="form2-group">
      <label>Correo Electrónico</label>
      <p>{{ cookData.correo }}</p>
    </div>

    <!-- Contraseña (solo lectura) -->
    <div class="form3-group">
      <label>Contraseña</label>
      <p>********</p> <!-- Mostramos los asteriscos para que no se vea la contraseña real -->
    </div>

    <div class="form4-group">
      <!-- Botón para volver a la pantalla Cocinero Home -->
      <button @click="volverAHome">Volver a Home</button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import '../styles/Perfil.css';

export default {
  data() {
    return {
      cookData: {
        nombre_usuario: '',
        correo: '',
        contrasena: ''
      }
    };
  },
  mounted() {
    this.obtenerDatosCocinero();
  },
  methods: {
    // Obtener datos del cocinero
    async obtenerDatosCocinero() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        const response = await axios.get(
          'https://taller6-alejo.onrender.com/me',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.cookData = response.data;
      } catch (error) {
        console.error('Error al obtener los datos del cocinero:', error);
        alert('No se pudieron cargar los datos del cocinero.');
      }
    },
    // Método para volver a la pantalla Cocinero Home
    volverAHome() {
      this.$router.push({ name: 'Cocinerohome' }); 
    }
  }
};
</script>
