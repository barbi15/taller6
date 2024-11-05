<template>
  <div class="admin-profile">
    <h2>Perfil del Administrador</h2>

    <!-- Botón para gestión de empleados -->
    <button class="employee-management-button" @click="irAGestionEmpleados">
      Gestión de Empleados
    </button>

    <!-- Datos del administrador (solo visualización) -->
    <div class="form-group">
      <label>Usuario</label>
      <p>{{ adminData.nombre_usuario }}</p>
    </div>

    <div class="form-group">
      <label>Correo Electrónico</label>
      <p>{{ adminData.correo }}</p>
    </div>

    <div class="form-group">
      <label>Contraseña</label>
      <!-- Mostrar la contraseña enmascarada con asteriscos -->
      <p>{{ maskedPassword }}</p>
    </div>

    <!-- Mensaje de éxito o error -->
    <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>

    <!-- Botón para volver a Admin Home -->
    <button class="back-button" @click="volverAtras">Volver a Admin Home</button>
  </div>
</template>

<script>
import axios from 'axios';
import '../styles/Perfil.css';
export default {
  data() {
    return {
      adminData: {
        nombre_usuario: '',
        correo: '',
        contrasena: ''
      },
      maskedPassword: '',
      message: '',
      success: false
    };
  },
  mounted() {
    this.obtenerDatosAdmin();
  },
  methods: {
    async obtenerDatosAdmin() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        const response = await axios.get(
          'https://taller6-alejo.onrender.com/usuarios/1',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Verificar si response.data tiene los datos esperados
        console.log("Datos recibidos del administrador:", response.data);

        // Si los datos están en la estructura correcta, asignarlos
        if (response.data.nombre_usuario && response.data.correo && response.data.contrasena) {
          this.adminData = response.data;
          this.maskedPassword = '*'.repeat(this.adminData.contrasena.length);
        } else {
          throw new Error("Estructura de datos inesperada");
        }
      } catch (error) {
        console.error('Error al obtener los datos del administrador:', error);
        this.message = 'No se pudieron cargar los datos del administrador.';
        this.success = false;
      }
    },
    async guardarCambios() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        await axios.put(
          'https://taller6-alejo.onrender.com/usuarios/1',
          this.adminData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.message = 'Datos actualizados correctamente.';
        this.success = true;
      } catch (error) {
        console.error('Error al actualizar los datos:', error);
        this.message = 'No se pudieron actualizar los datos.';
        this.success = false;
      }
    },
    irAGestionEmpleados() {
      this.$router.push('/gestionemple');
    },
    volverAtras() {
      this.$router.push('/Adminhome');
    }
  }
};
</script>
