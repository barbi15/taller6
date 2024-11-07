<template>
    <div class="listausu-cont">
      <h1>Lista de Usuarios</h1>
  
      <!-- Botón de volver atrás -->
      <button @click="volverAlHome" class="btn-back-home">Volver al Inicio</button>
  
      <!-- Contenedor de los usuarios con scroll -->
      <div class="usuarios-container">
        <!-- Mostrar los usuarios en una lista -->
        <ul>
          <li v-for="usuario in usuarios" :key="usuario.id">
            <div>
              <!-- Agregar "Usuario:" antes del nombre y "Correo:" antes del correo -->
              <span>Usuario: {{ usuario.nombre_usuario }} - Correo: {{ usuario.correo }}</span>
              <button @click="eliminarUsuario(usuario.id)" class="btn-delete">Eliminar</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        usuarios: [],
      };
    },
    mounted() {
      // Llamada a la API para obtener los usuarios
      this.obtenerUsuarios();
    },
    methods: {
      // Obtener la lista de usuarios
      async obtenerUsuarios() {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Token no encontrado.');
  
          const response = await axios.get('https://taller6-alejo.onrender.com/usuarios', {
            headers: {
              Authorization: `Bearer ${token}`, // Incluimos el token en la cabecera
            },
          });
          this.usuarios = response.data; // Asignar los datos a la variable usuarios
        } catch (error) {
          console.error('Error al obtener los usuarios:', error);
        }
      },
  
      // Eliminar un usuario
      async eliminarUsuario(id) {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Token no encontrado.');
  
          // Petición DELETE con el token en las cabeceras
          await axios.delete(`https://taller6-alejo.onrender.com/usuarios/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Pasamos el token en la cabecera
            },
          });
  
          // Filtrar el usuario eliminado de la lista local
          this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
          alert('Usuario eliminado con éxito');
        } catch (error) {
          console.error('Error al eliminar el usuario:', error);
          alert('Hubo un error al eliminar el usuario');
        }
      },
  
      // Método para redirigir al home del admin
      volverAlHome() {
        this.$router.push('/Adminhome');
      },
    },
  };
  </script>
  
  <style scoped>
  .listausu-cont {
    background-image: url('../images/loginfondo.jpeg');
    display: flex;
    flex-direction: column; /* Para que los elementos se apilen */
    align-items: center;
    height: 100vh; /* Asegura que el contenedor ocupe toda la altura de la pantalla */
  }
  
  .listausu-cont h1 {
    background-color: white;
    text-align: center;
    border-radius: 5px;
    margin-top: 5%;
    margin-bottom: 20px; /* Espacio entre el título y el contenedor */
  }
  
  .btn-back-home {
    background-color: #5cb85c;
    color: white;
    border: none;
    padding: 10px 20px;
    margin-bottom: 20px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .btn-back-home:hover {
    background-color: #4cae4c;
  }
  
  .usuarios-container {
    background-color: rgba(255, 255, 255, 0.9); /* Fondo blanco semi-transparente */
    width: 80%; /* Ajusta el tamaño del contenedor */
    max-width: 700px; /* Ancho máximo para que no se estire demasiado en pantallas grandes */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow-y: auto; /* Habilita el scroll si es necesario */
    max-height: 500px; /* Limita la altura máxima del contenedor */
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: rgba(251, 251, 251, 0.81);
    border: 1px solid #ddd;
    margin: 5px 0;
    border-radius: 5px;
  }
  
  .btn-delete {
    background-color: #5cb85c;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }
  
  .btn-delete:hover {
    background-color: #4cae4c;
  }
  </style>
  