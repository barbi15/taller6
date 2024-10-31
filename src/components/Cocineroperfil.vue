<template>
    <div class="cook-profile">
      <h2>Perfil del Cocinero</h2>
  
      <form @submit.prevent="guardarCambios">
        <!-- Campo de Usuario (solo lectura) -->
        <div class="form-group">
          <label>Usuario</label>
          <p>{{ cookData.nombre_usuario }}</p>
        </div>
  
        <!-- Campo de Email (editable) -->
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" id="email" v-model="cookData.correo" required />
        </div>
  
        <!-- Campo de Contraseña (editable) -->
        <div class="form-group">
          <label for="password">Nueva Contraseña</label>
          <input type="password" id="password" v-model="cookData.contrasena" />
        </div>
  
        <!-- Botón para guardar cambios -->
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
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
      // Guardar cambios de correo y/o contraseña
      async guardarCambios() {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Token no encontrado.');
  
          const updatedData = {
            correo: this.cookData.correo,
            contrasena: this.cookData.contrasena ? this.cookData.contrasena : undefined,
          };
  
          await axios.put('https://taller6-alejo.onrender.com/me', updatedData, {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          alert('Datos actualizados correctamente.');
        } catch (error) {
          console.error('Error al actualizar los datos:', error);
          alert('No se pudieron actualizar los datos.');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .cook-profile {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  