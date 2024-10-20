<template>
  <div>
    <h1>Comandas</h1>
    <ul>
      <li v-for="comanda in comandas" :key="comanda.id">
        <!-- Asegúrate de que comanda.product y comanda.quantity existan -->
        {{ comanda.product?.name || 'Producto desconocido' }} (Cantidad: {{ comanda.quantity || 0 }})
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      comandas: [] // Arreglo para almacenar las comandas
    };
  },
  mounted() {
    this.getComandas(); // Llamar a getComandas al montar el componente
  },
  methods: {
    getComandas() {
      const token = localStorage.getItem('token'); // Recuperar el token de localStorage

      if (!token) {
        console.error('No se encontró el token. No se puede autenticar la solicitud.');
        return;
      }

      axios.get('https://rotiserialatriada-lsyn.onrender.com/api/comandas', {
        headers: {
          Authorization: `Bearer ${token}` // Incluir el token en la solicitud
        }
      })
      .then(response => {
        // Verifica si la respuesta tiene datos y ajusta la estructura según lo esperado
        this.comandas = response.data;
      })
      .catch(error => {
        console.error('Error al obtener las comandas:', error.response ? error.response.data : error.message);
      });
    }
  }
};
</script>

<style scoped>
/* Estilos personalizados para la lista de comandas */
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>
