<template>
    <div class="stock-container">
      <h1 class="title">Gestión de Stock</h1>
  
      <!-- Buscador de productos -->
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="Buscar producto..." />
      </div>
  
      <!-- Lista de Productos -->
      <ul class="product-list">
        <li v-for="product in filteredProducts" :key="product.id" class="product-item">
          <div class="product-details">
            <span>{{ product.nombre }}</span> - ${{ product.precio }} (Stock: {{ product.stock }})
          </div>
          <div class="product-actions">
            <button @click="updateStock(product, -1)" class="stock-button">-</button>
            <span class="stock-quantity">{{ product.stock }}</span>
            <button @click="updateStock(product, 1)" class="stock-button">+</button>
          </div>
        </li>
      </ul>
  
      <!-- Botón para volver a la pantalla de inicio -->
      <button class="back-button" @click="volver">Volver a Admin Home</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        products: [], // Almacena los productos obtenidos del backend
        searchQuery: '' // Cadena de búsqueda para filtrar productos
      };
    },
    computed: {
      filteredProducts() {
        return this.products.filter(product =>
          product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    },
    mounted() {
      this.getProducts(); // Obtener los productos al montar el componente
    },
    methods: {
      // Método para obtener productos del backend
      getProducts() {
        axios
          .get('https://rotiserialatriada.onrender.com/api/productos')
          .then(response => {
            this.products = response.data;
          })
          .catch(error => {
            console.error('Error al obtener productos:', error);
          });
      },
  
      // Método para actualizar el stock de un producto
      updateStock(product, change) {
        if (product.stock + change < 0) {
          alert('El stock no puede ser menor a cero.');
          return;
        }
        axios
          .put(`https://rotiserialatriada.onrender.com/api/productos/${product.id}`, {
            stock: product.stock + change
          })
          .then(response => {
            product.stock += change; // Actualizar el stock localmente tras éxito de la operación
            console.log(`Stock actualizado: ${product.nombre} - ${product.stock}`);
          })
          .catch(error => {
            console.error('Error al actualizar el stock:', error);
          });
      },
  
      // Método para volver a la pantalla de Admin Home
      volver() {
        this.$router.push('/admin'); // Ajusta la ruta según la configuración de tus rutas
      }
    }
  };
  </script>
  
  <style scoped>
  /* Estilos de la pantalla de gestión de stock */
  .stock-container {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .search-bar {
    margin-bottom: 20px;
  }
  
  .product-list {
    list-style-type: none;
    padding: 0;
  }
  
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  
  .product-details {
    flex-grow: 1;
  }
  
  .product-actions {
    display: flex;
    align-items: center;
  }
  
  .stock-button {
    padding: 5px 10px;
    margin: 0 5px;
  }
  
  .stock-quantity {
    width: 40px;
    text-align: center;
  }
  
  .back-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .back-button:hover {
    background-color: #0056b3;
  }
  </style>
  