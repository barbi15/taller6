<template>
  <div class="cocinero-home">
    <h1>Pantalla del Cocinero</h1>

    <div class="top-buttons">
      <button @click="irAPerfilCocinero" class="perfil-button">Ver Perfil</button>
      <button @click="cerrarSesion" class="cerrarsesion-button">Cerrar Sesión</button>
    </div>

    <!-- Botón para obtener la cotización del dólar más pequeño -->
    <div class="dolar-cotizacion">
      <button @click="obtenerCotizacionDolar" class="cotizacion-button">Obtener Cotización del Dólar</button>
      <p v-if="cotizacionDolar">Cotización actual del dólar: {{ cotizacionDolar }}</p>
    </div>

    <h2>Lista de Comandas</h2>

    <!-- Contenedor con scroll para la tabla -->
    <div class="tabla-container">
      <table class="comandas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Precio Total</th>
            <th>Fecha de Creación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comanda in comandas" :key="comanda.id">
            <td>{{ comanda.id }}</td>
            <td>{{ comanda.precio_total }}</td>
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
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import '../styles/Cocinero.css';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      comandas: [],
      cotizacionDolar: null,
      errorMessage: '',
    };
  },
  mounted() {
    this.getComandas();
  },
  methods: {
    irAPerfilCocinero() {
      this.router.push('/CocineroPerfil');
    },
    cerrarSesion() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      this.router.push('/login');
    },
    getComandas() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMessage = 'No se encontró el token. Por favor, inicia sesión nuevamente.';
        return;
      }

      axios
        .get('https://rotiserialatriada-dgjb.onrender.com/api/comandas', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          this.comandas = response.data;
        })
        .catch((error) => {
          this.errorMessage = 'Error al obtener las comandas: ' + error.message;
          console.error('Error al obtener las comandas:', error);
        });
    },
    async updateComanda(comandaId, newState) {
      const token = localStorage.getItem('token');
      const payload = { estado: newState };

      axios
        .put(
          `https://rotiserialatriada-dgjb.onrender.com/api/comandas/${comandaId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          alert(`Estado de la comanda actualizado a: ${newState}`);
          this.getComandas();
        })
        .catch((error) => {
          this.errorMessage = 'Error al actualizar la comanda: ' + error.message;
          console.error(`Error al actualizar la comanda ${comandaId}:`, error);
        });
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    obtenerCotizacionDolar() {
      axios
        .get('https://api.exchangerate-api.com/v4/latest/USD')
        .then((response) => {
          this.cotizacionDolar = response.data.rates.ARS;
        })
        .catch((error) => {
          this.errorMessage = 'Error al obtener la cotización del dólar: ' + error.message;
          console.error('Error al obtener la cotización del dólar:', error);
        });
    },
  },
};
</script>
