<template>
  <div class="cook-profile">
    <h2>Perfil del Cocinero</h2>

    <!-- Campo de Usuario (solo lectura) -->
    <div class="form1-group">
      <label>Usuario</label>
      <p>{{ cookData.nombre_usuario }}</p>
    </div>

    <!-- Modificar Correo -->
    <div class="form2-group">
      <label>Correo Electrónico</label>
      <p>{{ cookData.correo }}</p>
      <button type="button3" @click="toggleEmailEdit">Modificar Correo</button>
      <div v-if="isEmailEditVisible">
        <input type="email" v-model="newEmail" placeholder="Nuevo correo" required />
      </div>
    </div>

    <!-- Modificar Contraseña -->
    <div class="form3-group">
      <label>Contraseña</label>
      <button type="button3" @click="togglePasswordEdit">Actualizar Contraseña</button>
      <div v-if="isPasswordEditVisible">
        <input type="password" v-model="newPassword" placeholder="Nueva contraseña" />
      </div>
    </div>
    <div class="form4-group">
    <!-- Botón para guardar cambios -->
    <button @click="guardarCambios">Guardar Cambios</button>
    <!-- Botón para volver a la pantalla Cocinero Home -->
    <button @click="volverAHome">Volver a Home</button>
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
      },
      newEmail: '',
      newPassword: '',
      isEmailEditVisible: false,
      isPasswordEditVisible: false
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
    // Alternar la visibilidad del campo de correo
    toggleEmailEdit() {
      this.isEmailEditVisible = !this.isEmailEditVisible;
      this.newEmail = this.cookData.correo; // Prellenar con el correo actual
    },
    // Alternar la visibilidad del campo de contraseña
    togglePasswordEdit() {
      this.isPasswordEditVisible = !this.isPasswordEditVisible;
      this.newPassword = ''; // Limpiar el campo al mostrarlo
    },
    // Guardar cambios de correo y/o contraseña
    async guardarCambios() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        const updatedData = {};
        if (this.isEmailEditVisible) updatedData.correo = this.newEmail;
        if (this.isPasswordEditVisible) updatedData.contrasena = this.newPassword;

        await axios.put('https://taller6-alejo.onrender.com/me', updatedData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('Datos actualizados correctamente.');
        this.obtenerDatosCocinero(); // Recargar los datos actualizados
        this.isEmailEditVisible = false;
        this.isPasswordEditVisible = false;
      } catch (error) {
        console.error('Error al actualizar los datos:', error);
        alert('No se pudieron actualizar los datos.');
      }
    },
    // Método para volver a la pantalla Cocinero Home
    volverAHome() {
      this.$router.push({ name: 'Cocinerohome' }); 
    }
  }
};
</script>
