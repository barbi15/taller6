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
      <p>{{ adminData.usuario }}</p>
    </div>

    <div class="form-group">
      <label>Correo Electrónico</label>
      <p>{{ adminData.email }}</p>
    </div>

    <div class="form-group">
      <label>Contraseña</label>
      <p>********</p> <!-- Contraseña oculta -->
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      adminData: {
        usuario: '',
        email: '',
        password: ''
      }
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
          'https://taller6-alejo.onrender.com/me',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.adminData = response.data;
      } catch (error) {
        console.error('Error al obtener los datos del administrador:', error);
        alert('No se pudieron cargar los datos del administrador.');
      }
    },
    irAGestionEmpleados() {
      this.$router.push('/gestionemple');
    }
  }
};
</script>

<style scoped>
.admin-profile {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #a39d9d;
  border-radius: 10px;
  background-color: #fbf1f1;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.employee-management-button {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  background-color: #28a745;
  color: rgb(248, 240, 240);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.employee-management-button:hover {
  background-color: #218838;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

p {
  padding: 8px;
  background-color: #c8ccd0;
  border-radius: 5px;
}
</style>
