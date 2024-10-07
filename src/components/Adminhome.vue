<template>
  <div class="admin-home-container">
    <h1 class="title">Pantalla de inicio del administrador</h1>
    <h2 class="subtitle">Productos</h2>
    <ul class="product-list">
      <li v-for="product in products" :key="product.id" class="product-item">
        {{ product.nombre }} (Stock: {{ product.stock }})
        <button @click="createOrder(product)" class="create-order-button">Crear comanda</button>
      </li>
    </ul>
    <Comandas />
  </div>
</template>

<script>
import axios from 'axios';
import Comandas from '../components/Comandas.vue'; // Ajusta la ruta según sea necesario

export default {
  data() {
    return {
      products: [],
    };
  },
  mounted() {
    this.getProducts();
  },
  methods: {
    getProducts() {
      axios
        .get('https://rotiserialatriada.onrender.com/api/productos')
        .then((response) => {
          this.products = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    createOrder(product) {
      axios
        .post('https://rotiserialatriada.onrender.com/api/comandas', {
          product_id: product.id,
          quantity: 1, // Por defecto, se crea una comanda con una unidad del producto
        })
        .then((response) => {
          this.updateStock(product, -1);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    updateStock(product, quantity) {
      axios
        .put(`/api/products/${product.id}`, {
          stock: product.stock + quantity,
        })
        .then((response) => {
          console.log(`Stock actualizado: ${product.nombre} - ${product.stock}`);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.admin-home-container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(230, 223, 223, 0.468);
  max-width: 800px;
  margin: auto;
  text-align: center;
}

.title {
  color: #f85903;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.product-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-item {
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(230, 223, 223, 0.468);
}

.product-item:hover {
  background-color: #f9f9f9;
}

.create-order-button {
  background-color: #f85903;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-order-button:hover {
  background-color: #e64e08f9;
}
</style>