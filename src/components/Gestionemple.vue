<template>
    <div class="admin-container">
      <h2>Gestión de Empleados</h2>
  
      <!-- Lista de empleados -->
      <table class="employee-table">
        <thead>
          <tr>
            <th>Nombre de Usuario</th>
            <th>Correo Electrónico</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empleado in empleados" :key="empleado.id">
            <td>{{ empleado.nombre_usuario }}</td>
            <td>{{ empleado.correo }}</td>
            <td>
              <button @click="verDetalles(empleado)">Ver Detalles</button>
              <button @click="eliminarEmpleado(empleado.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        empleados: [] // Lista de empleados (usuarios no administradores)
      };
    },
    methods: {
      // Obtener lista de empleados (usuarios no administradores)
      async obtenerEmpleados() {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Token no encontrado.');
  
          const response = await axios.get('https://taller6-alejo.onrender.com/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          this.empleados = response.data; // Cargar los datos de empleados en el array
        } catch (error) {
          console.error('Error al obtener empleados:', error);
          alert('Error al obtener la lista de empleados');
        }
      },
  
      // Ver detalles de un empleado (mostrar en consola o en una vista detallada)
      verDetalles(empleado) {
        console.log("Mostrando detalles para:", empleado);
        // Aquí podrías redirigir a una vista detallada o abrir un modal
      },
  
      // Eliminar un empleado de la lista
      async eliminarEmpleado(id) {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Token no encontrado.');
  
          await axios.delete(`https://taller6-alejo.onrender.com/usuarios/7${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          // Filtrar el empleado eliminado de la lista localmente
          this.empleados = this.empleados.filter(empleado => empleado.id !== id);
          alert('Empleado eliminado correctamente');
        } catch (error) {
          console.error('Error al eliminar empleado:', error);
          alert('Error al eliminar el empleado');
        }
      }
    },
    mounted() {
      this.obtenerEmpleados();
    }
  };
  </script>
  
  <style scoped>
  .admin-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
  }
  
  .employee-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .employee-table th, .employee-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  button {
    margin-right: 8px;
    padding: 6px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  