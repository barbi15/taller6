<template>
  <div class="fondo-cont">
    <div class="cook-profile">
      <h2>Perfil del Cocinero</h2>

      <!-- Campo de Usuario (solo lectura) -->
      <div class="form1-group">
        <label>Usuario</label>
        <p>{{ cookData.nombre_usuario }}</p>
      </div>

      <!-- Campo de Correo Electrónico (editable) -->
      <div class="form2-group">
        <label for="correo">Correo Electrónico</label>
        <input
          v-model="cookData.correo"
          id="correo"
          type="email"
          placeholder="Actualizar correo electrónico"
        />
      </div>

      <!-- Campo de Contraseña (editable) -->
      <div class="form3-group">
        <label for="contrasena">Contraseña</label>
        <input
          v-model="cookData.contrasena"
          id="contrasena"
          type="password"
          placeholder="Actualizar contraseña"
        />
      </div>

      <!-- Botón para guardar los cambios -->
      <div class="form4-group">
        <button @click="actualizarPerfil">Guardar Cambios</button>
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
    // Método para actualizar el perfil (correo y contraseña)
    async actualizarPerfil() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Token no encontrado. Por favor, inicie sesión nuevamente.');
          return;
        }

        const payload = {
          correo: this.cookData.correo,
          contrasena: this.cookData.contrasena
        };

        const response = await axios.patch(
          'https://taller6-alejo.onrender.com/me',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          this.cookData = response.data; // Actualiza cookData con los datos devueltos
          alert('Perfil actualizado exitosamente.');
        }
      } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        if (error.response && error.response.status === 401) {
          alert('No autorizado. Por favor, inicie sesión nuevamente.');
        } else if (error.code === 'ERR_NETWORK') {
          alert('Error de red. Verifica tu conexión o intenta nuevamente más tarde.');
        } else {
          alert('Error al actualizar el perfil.');
        }
      }
    },
    // Método para volver a la pantalla Cocinero Home
    volverAHome() {
      this.$router.push({ name: 'Cocinerohome' });
    }
  }
};
</script>
