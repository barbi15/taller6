<template>
  <div class="cocinero-home">
    <h1>Pantalla del Cocinero</h1>

    <div class="logo3-container">
      <img src='../images/logorotiseria.png' alt="Logo" id="logo">
    </div>
    <div class="top-buttons">
      <button @click="irAPerfilCocinero" class="perfil-button">Ver Perfil</button>
      <button @click="cerrarSesion" class="cerrarsesion-button">Cerrar Sesión</button>
    </div>

    <div class="title-comanda">
    <h2>Lista de Comandas</h2>
</div>
    <div class="tabla-container">
      <table class="comandas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Precio Total</th>
            <th>Fecha de Creación</th>
            <th>Estado</th>
            <th>Detalles</th>
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
              <button @click="verDetallesComanda(comanda.id)">Ver Detalles</button>
            </td>
            <td>
              <button @click="updateComanda(comanda.id, comanda.estado)">Actualizar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para mostrar los detalles de la comanda -->
    <div v-if="mostrarDetalles" class="modal-detalles">
      <h3>Detalles de la Comanda {{ detallesComanda.id }}</h3>
      <ul>
        <li v-for="producto in detallesComanda.productos" :key="producto.id">
          {{ producto.producto_nombre }} - Cantidad: {{ producto.cantidad }}
        </li>
      </ul>
      <button @click="cerrarModal">Cerrar</button>
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
      detallesComanda: {
        id: null,
        productos: []
      },
      mostrarDetalles: false,
      errorMessage: '',
      autoUpdateInterval: null, // Variable para almacenar el intervalo de actualización automática
    };
  },
  mounted() {
    this.getComandas();
    // Iniciar la actualización automática cada 10 segundos
    this.autoUpdateInterval = setInterval(this.getComandas, 10000); // 10000 ms = 10 segundos
  },
  beforeDestroy() {
    // Limpiar el intervalo cuando el componente se destruya
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
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
          console.log(response.data);  // Imprimir los datos para verificar qué llega
          // Filtrar las comandas para que solo se vean las que tienen el estado 'Procesandose'
          this.comandas = response.data.filter(comanda => comanda.estado === 'Procesandose');
        })
        .catch((error) => {
          this.errorMessage = 'Error al obtener las comandas: ' + error.message;
          console.error('Error al obtener las comandas:', error);
        });
    },
    async verDetallesComanda(comandaId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        const response = await axios.get(`https://rotiserialatriada-dgjb.onrender.com/api/comanda_productos/${comandaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.detallesComanda = {
          id: comandaId,
          productos: response.data
        };
        this.mostrarDetalles = true;
      } catch (error) {
        this.errorMessage = 'Error al obtener detalles de la comanda: ' + error.message;
        console.error('Error al obtener detalles de la comanda:', error);
      }
    },
    cerrarModal() {
      this.mostrarDetalles = false;
      this.detallesComanda = { id: null, productos: [] };
    },
    async updateComanda(comandaId, newState) {
      const token = localStorage.getItem('token');
      const payload = { estado: newState };

      try {
        // Realizar la petición PUT para actualizar el estado de la comanda
        await axios.put(
          `https://rotiserialatriada-dgjb.onrender.com/api/comandas/${comandaId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Mostrar mensaje de éxito al usuario
        alert(`Estado de la comanda actualizado a: ${newState}`);

        // Llamar a getComandas() para recargar la lista completa de comandas
        await this.getComandas();
      } catch (error) {
        this.errorMessage = 'Error al actualizar la comanda: ' + error.message;
        console.error(`Error al actualizar la comanda ${comandaId}:`, error);
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
</script>