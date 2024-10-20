<template>
  <div class="cocinero-home">
    <h1>Pantalla del Cocinero</h1>

    <!-- Botón para obtener la cotización del dólar -->
    <div class="dolar-cotizacion">
      <button @click="obtenerCotizacionDolar">Obtener Cotización del Dólar</button>
      <p v-if="cotizacionDolar">Cotización actual del dólar: {{ cotizacionDolar }}</p>
    </div>

    <h2>Lista de Comandas</h2>
    <table class="comandas-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Precio Total</th>
          <!-- Eliminamos la columna de Cotización Dólar -->
          <th>Fecha de Creación</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comanda in comandas" :key="comanda.id">
          <td>{{ comanda.id }}</td>
          <td>{{ comanda.precio_total }}</td>
          <!-- Cotización Dólar ya no está aquí -->
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
import '../styles/adm-coc.css';
import axios from 'axios'; // Importar axios para hacer solicitudes HTTP

export default {
data() {
  return {
    comandas: [], // Lista de comandas obtenidas del servidor
    cotizacionDolar: null, // Almacenar la cotización del dólar
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
      .get('https://rotiserialatriada-dgjb.onrender.com/api/comandas', {
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
        `https://rotiserialatriada-dgjb.onrender.com/api/comandas/${comandaId}`,
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

  // Método para obtener la cotización actual del dólar desde una API externa
  obtenerCotizacionDolar() {
    axios
      .get('https://api.exchangerate-api.com/v4/latest/USD') // Ejemplo de API para obtener la cotización del dólar
      .then((response) => {
        this.cotizacionDolar = response.data.rates.ARS; // Asumiendo que deseas la cotización en ARS
      })
      .catch((error) => {
        this.errorMessage = 'Error al obtener la cotización del dólar: ' + error.message;
        console.error('Error al obtener la cotización del dólar:', error);
      });
  },
},
};
</script>
