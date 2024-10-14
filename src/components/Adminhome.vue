<template>
  <div class="admin-home-container">
    <h1 class="title">Pantalla de inicio del administrador</h1>

    <!-- Botones de navegación -->
    <div class="nav-buttons">
      <button class="gestor-comandas-button" @click="irAGestorDeComandas">Gestor de Comandas</button>
      <button class="dollar-button" @click="getDollarPrice">Cotización del Dólar</button>
    </div>

    <!-- Cotización del dólar -->
    <div v-if="dollarPrice" class="dollar-price">
      <p>Cotización actual del dólar: ${{ dollarPrice }}</p>
    </div>

    <!-- Contenedor principal que divide la pantalla en dos -->
    <div class="main-content">
      <!-- Columna izquierda: búsqueda y productos -->
      <div class="left-panel">
        <!-- Buscador de productos -->
        <div class="search-bar">
          <input v-model="searchQuery" placeholder="Buscar producto..." />
          <button class="search-button"><i class="fas fa-search"></i></button>
        </div>

        <!-- Tabla de productos -->
        <table class="product-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>{{ product.nombre }}</td>
              <td>{{ product.precio }}</td>
              <td>{{ product.stock }}</td>
              <td>
                <button @click="decreaseQuantity(product)" class="remove-from-order-button">-</button>
                <span>{{ product.quantity || 0 }}</span>
                <button @click="increaseQuantity(product)" class="add-to-order-button">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Columna derecha: comanda actual -->
      <div class="right-panel">
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

        <!-- Estado de las Comandas -->
        <div class="order-status-container">
          <h2>Estado de las Comandas</h2>
          <ul>
            <li v-for="order in activeOrders" :key="order.id">
              {{ order.producto }} - Cantidad: {{ order.cantidad }} - Estado: {{ order.estado }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      products: [],
      currentOrder: [],
      searchQuery: '',
      activeOrders: [],
      dollarPrice: null,
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
    irAGestorDeComandas() {
      this.$router.push('/stock'); // Navega a la pantalla de stock
    },
    getDollarPrice() {
      axios.get('https://api.exchangerate-api.com/v4/latest/USD').then((response) => {
        this.dollarPrice = response.data.rates.ARS;
      });
    },
    getProducts() {
  axios.get('https://rotiserialatriada.onrender.com/api/productos')
    .then((response) => {
      this.products = response.data.map((product) => ({
        ...product,
        quantity: 0,
      }));
    })
    .catch((error) => {
      // Manejo del error
      console.error('Error al obtener productos:', error.message);
      if (error.response) {
        console.error('Error en la respuesta:', error.response.data);
        console.error('Código de estado:', error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    });
},
    increaseQuantity(product) {
      if (product.quantity < product.stock) {
        product.quantity += 1;
      }
    },
    decreaseQuantity(product) {
      if (product.quantity > 0) {
        product.quantity -= 1;
      }
    },
    addToOrder(product) {
      const existingItem = this.currentOrder.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.cantidad += 1;
      } else {
        this.currentOrder.push({ ...product, cantidad: 1 });
      }
    },
    removeFromOrder(item) {
      const index = this.currentOrder.indexOf(item);
      if (index > -1) {
        this.currentOrder.splice(index, 1);
      }
    },
    confirmOrder() {
      this.currentOrder.forEach((item) => {
        this.createOrder(item);
        this.updateStock(item, -item.cantidad);
      });
      this.currentOrder = [];
    },
    getActiveOrders() {
      axios.get('https://rotiserialatriada.onrender.com/api/comandas').then((response) => {
        this.activeOrders = response.data.filter(
          (order) => order.estado !== 'cerrada' && order.estado !== 'cancelada'
        );
      });
    },
    createOrder(product) {
      axios.post('https://rotiserialatriada.onrender.com/api/comandas', {
        product_id: product.id,
        quantity: product.cantidad,
      });
    },
    updateStock(product, quantity) {
      axios.put(`https://rotiserialatriada.onrender.com/api/productos/${product.id}`, {
        stock: product.stock + quantity,
      });
    },
  },
};
</script>