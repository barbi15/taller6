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
  export default {
    data() {
      return {
        comandas: []
      }
    },
    mounted() {
      this.getComandas()
    },
    methods: {
      getComandas() {
        axios.get('https://rotiserialatriada.onrender.com/api/comandas')
          .then(response => {
            this.comandas = response.data
          })
          .catch(error => {
            console.error(error)
          })
      }
    }
  }
  </script>