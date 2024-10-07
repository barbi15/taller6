<template>
    <div class="cocinero-home">
      <h1>Pantalla del Cocinero</h1>
      <h2>Lista de Comandas</h2>
      <table class="comandas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Precio Total</th>
            <th>Cotización Dólar</th>
            <th>Fecha de Creación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comanda in comandas" :key="comanda.id">
            <td>{{ comanda.id }}</td>
            <td>{{ comanda.precio_total }}</td>
            <td>{{ comanda.cotizacion_dolar }}</td>
            <td>{{ formatDate(comanda.created_at) }}</td>
            <td>
              <select v-model="comanda.estado">
                <option value="Entregado">Entregado</option>
                <option value="Procesandose">Procesandose</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </td>
            <td>
              <button @click="updateComanda(comanda.id, comanda.estado)">Actualizar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios'; // Importar axios para hacer solicitudes HTTP
  
  export default {
    data() {
      return {
        comandas: [], // Lista de comandas obtenidas del servidor
        errorMessage: '', // Mensaje de error para mostrar en la interfaz
      };
    },
    mounted() {
      this.getComandas(); // Llamar al método para obtener comandas al montar el componente
    },
    methods: {
      // Método para obtener las comandas del servidor
      getComandas() {
        const token = localStorage.getItem('token'); // Obtener el token de localStorage
        console.log("Token utilizado para la solicitud:", token);
  
        if (!token) {
          this.errorMessage = 'No se encontró el token. Por favor, inicia sesión nuevamente.';
          return;
        }
  
        axios
          .get('https://rotiserialatriada.onrender.com/api/comandas', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log("Comandas obtenidas:", response.data);
            this.comandas = response.data;
          })
          .catch((error) => {
            this.errorMessage = 'Error al obtener las comandas: ' + error.response?.data?.message || error.message;
            console.error('Error al obtener las comandas:', error);
          });
      },
  
      // Método para obtener el usuario
      async getUsuario() {
        const token = localStorage.getItem('token'); // Obtener el token de localStorage
        if (!token) {
          this.errorMessage = 'No se encontró el token. Por favor, inicia sesión nuevamente.';
          return null;
        }
  
        try {
          const response = await axios.get('https://taller6-alejo.onrender.com/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data; // Devuelve el usuario
        } catch (error) {
          this.errorMessage = 'Error al obtener el usuario: ' + error.message;
          console.error('Error al obtener el usuario:', error);
          return null;
        }
      },
  
      // Método para actualizar el estado de la comanda
      async updateComanda(comandaId, newState) {
        const usuario = await this.getUsuario(); // Llamar a getUsuario
  
        if (!usuario) {
          this.errorMessage = 'No se pudo obtener el usuario.';
          return;
        }
  
        const token = localStorage.getItem('token'); // Recuperar el token almacenado en localStorage
  
        const payload = { estado: newState };
        console.log(`Payload enviado para la comanda ${comandaId}:`, payload);
  
        axios
          .put(
            `https://rotiserialatriada.onrender.com/api/comandas/${comandaId}`,
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((response) => {
            console.log(`Comanda ${comandaId} actualizada con estado: ${newState}`);
            alert(`Estado de la comanda actualizado a: ${newState}`);
            this.getComandas(); // Volver a obtener las comandas para refrescar la lista
          })
          .catch((error) => {
            console.error(`Error al actualizar la comanda ${comandaId}:`, error.response?.data || error.message);
  
            if (error.response) {
              this.errorMessage = `Error al actualizar la comanda ${comandaId}: ${error.response.data.error || 'Problema en el servidor.'}`;
            } else if (error.request) {
              this.errorMessage = 'El servidor no respondió. Por favor, verifica la conexión.';
            } else {
              this.errorMessage = `Error de configuración: ${error.message}`;
            }
          });
      },
  
      // Método para formatear la fecha de creación de la comanda
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Estilos */
  .cocinero-home {
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .comandas-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .comandas-table th,
  .comandas-table td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  .comandas-table th {
    background-color: #f2f2f2;
  }
  
  .comandas-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .comandas-table tr:hover {
    background-color: #f1f1f1;
  }
  
  select {
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  
  button {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #38a169;
  }
  
  .error {
    color: red;
    margin-top: 20px;
  }
  </style>
  