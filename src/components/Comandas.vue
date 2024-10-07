<template>
  <div>
    <h1>Comandas</h1>
    <ul>
      <li v-for="comanda in comandas" :key="comanda.id">
        {{ comanda.product.name }} (Cantidad: {{ comanda.quantity }})
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'; // Importación de axios para hacer solicitudes HTTP

export default {
  data() {
    return {
      comandas: [] // Arreglo para almacenar las comandas
    }
  },
  mounted() {
    this.getComandas() // Llamar a getComandas al montar el componente
  },
  methods: {
    getComandas() {
      axios.get('https://rotiserialatriada.onrender.com/api/comandas')
        .then(response => {
          this.comandas = response.data; // Asignar las comandas al arreglo
        })
        .catch(error => {
          console.error('Error al obtener las comandas:', error); // Mostrar error en consola
        })
    }
  }
}
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
