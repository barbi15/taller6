<template>
  <div class="admin-home-container">
    <h1 class="title">Pantalla de inicio del administrador</h1>

    <!-- Botón para Gestor de Comandas -->
    <button class="gestor-comandas-button" @click="irAGestorDeComandas">Gestor de Comandas</button>

    <!-- Buscador de productos -->
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="Buscar producto..." />
    </div>

    <!-- Lista de Productos con buscador -->
    <h2 class="subtitle">Productos</h2>
    <ul class="product-list">
      <li v-for="product in filteredProducts" :key="product.id" class="product-item">
        {{ product.nombre }} - ${{ product.precio }} (Stock: {{ product.stock }})
        <button @click="addToOrder(product)" class="add-to-order-button">Añadir a Comanda</button>
      </li>
    </ul>

    <!-- Vista de la Comanda -->
    <div class="comanda-container">
      <h2>Comanda Actual</h2>
      <table class="comanda-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in currentOrder" :key="item.id">
            <td>{{ item.nombre }}</td>
            <td>{{ item.precio }}</td>
            <td>{{ item.cantidad }}</td>
            <td>{{ (item.precio * item.cantidad).toFixed(2) }}</td>
            <td>
              <button @click="removeFromOrder(item)" class="remove-item-button">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="confirmOrder" class="confirm-order-button">Confirmar Comanda</button>
    </div>

    <!-- Estado de las Comandas -->
    <div class="order-status-container">
      <h2>Estado de las Comandas</h2>
      <ul>
        <li v-for="order in activeOrders" :key="order.id">
          {{ order.producto }} - Cantidad: {{ order.cantidad }} - Estado: {{ order.estado }}
        </li>
      </ul>
    </div>

    <!-- Cotización del dólar -->
    <div class="dollar-price-container">
      <button @click="getDollarPrice" class="dollar-button">Cotización del Dólar</button>
      <p v-if="dollarPrice">Cotización actual: ${{ dollarPrice }}</p>
    </div>

    <Comandas />
  </div>
</template>

<script>
import axios from 'axios';
import Comandas from '../components/Comandas.vue'; // Ajusta la ruta según sea necesario

export default {
  components: { Comandas },
  data() {
    return {
      products: [],
      currentOrder: [], // Productos agregados a la comanda actual
      searchQuery: '', // Valor de búsqueda
      activeOrders: [], // Comandas activas
      dollarPrice: null, // Cotización del dólar
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) =>
        product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    this.getProducts();
    this.getActiveOrders();
  },
  methods: {
    // Método para obtener productos del backend
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

    // Añadir producto a la comanda actual
    addToOrder(product) {
      const existingItem = this.currentOrder.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.cantidad += 1;
      } else {
        this.currentOrder.push({ ...product, cantidad: 1 });
      }
    },

    // Eliminar producto de la comanda actual
    removeFromOrder(item) {
      const index = this.currentOrder.indexOf(item);
      if (index > -1) {
        this.currentOrder.splice(index, 1);
      }
    },

    // Confirmar la comanda y actualizar el stock
    confirmOrder() {
      this.currentOrder.forEach((item) => {
        this.createOrder(item);
        this.updateStock(item, -item.cantidad); // Reducir el stock
      });
      this.currentOrder = []; // Vaciar la comanda
    },

    // Crear comanda en la base de datos
    createOrder(product) {
      axios
        .post('https://rotiserialatriada.onrender.com/api/comandas', {
          product_id: product.id,
          quantity: product.cantidad,
        })
        .then((response) => {
          console.log('Comanda creada:', response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    // Actualizar el stock de un producto en la base de datos
    updateStock(product, quantity) {
      axios
        .put(`https://rotiserialatriada.onrender.com/api/productos/${product.id}`, {
          stock: product.stock + quantity,
        })
        .then((response) => {
          console.log(`Stock actualizado: ${product.nombre} - ${product.stock}`);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    // Obtener las comandas activas (excepto cerradas y canceladas)
    getActiveOrders() {
      axios
        .get('https://rotiserialatriada.onrender.com/api/comandas')
        .then((response) => {
          this.activeOrders = response.data.filter(
            (order) => order.estado !== 'cerrada' && order.estado !== 'cancelada'
          );
        })
        .catch((error) => {
          console.error(error);
        });
    },

    // Consultar la cotización del dólar
    getDollarPrice() {
      axios
        .get('https://api.exchangerate-api.com/v4/latest/USD')
        .then((response) => {
          this.dollarPrice = response.data.rates.ARS; // Asumiendo que necesitas la cotización en pesos argentinos (ARS)
        })
        .catch((error) => {
          console.error(error);
        });
    },

    // Navegar a la pantalla de stock
    irAGestorDeComandas() {
      this.$router.push('/stock'); // Ajusta la ruta según tu configuración
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