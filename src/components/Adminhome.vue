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
          <input v-model="searchQuery" @keyup.enter="filterProducts" placeholder="Buscar producto..." />
          <button @click="filterProducts" class="search-button">
            <img src='../images/lupa.png' alt="Buscar" class="search-icon" />
          </button>
        </div>

        <!-- Tabla de productos -->
        <table class="product-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad Disponible</th>
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

        <!-- Mostrar el total de la comanda -->
        <div class="total">
          <h3>Total: ${{ totalOrder.toFixed(2) }}</h3>
        </div>

        <button @click="confirmOrder" class="confirm-order-button">Confirmar Comanda</button>

        <!-- Tabla de comandas confirmadas -->
        <div class="order-status-container">
          <h2>Lista de Comandas Confirmadas</h2>
          <table class="confirmed-orders-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in activeOrders" :key="order.id">
                <td>{{ order.producto }}</td>
                <td>{{ order.cantidad }}</td>
                <td>{{ order.estado }}</td>
                <td>
                  <button @click="deleteOrder(order.id)" class="delete-order-button">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
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
      currentOrder: [], // Lista de productos en la comanda actual
      searchQuery: '', // Consulta de búsqueda
      activeOrders: [], // Lista de comandas activas
      dollarPrice: null,
      token: null, // Añadido para almacenar el token
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) =>
        product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    totalOrder() {
      return this.currentOrder.reduce((total, item) => {
        return total + item.precio * item.cantidad;
      }, 0);
    },
  },
  mounted() {
    this.token = localStorage.getItem('token'); // Recuperar el token
    this.getProducts(); // Obtener productos al montar el componente
    this.getActiveOrders(); // Obtener comandas activas
  },
  methods: {
    irAGestorDeComandas() {
      this.$router.push('/stock'); // Navegar a la pantalla de stock
    },
    getDollarPrice() {
      axios.get('https://api.exchangerate-api.com/v4/latest/USD').then((response) => {
        this.dollarPrice = response.data.rates.ARS;
      });
    },
    getProducts() {
      axios
        .get('https://rotiserialatriada.onrender.com/api/productos', {
          headers: {
            Authorization: `Bearer ${this.token}` // Añadido para autenticar la solicitud
          }
        })
        .then((response) => {
          this.products = response.data.map((product) => ({
            ...product,
            quantity: 0, // Iniciar la cantidad en 0
          }));
        })
        .catch((error) => {
          console.error('Error al obtener productos:', error.message);
        });
    },
    filterProducts() {
      console.log('Filtrando productos:', this.searchQuery);
    },
    increaseQuantity(product) {
      if (product.quantity < product.stock) {
        product.quantity += 1;
        this.addToOrder(product);
      }
    },
    decreaseQuantity(product) {
      if (product.quantity > 0) {
        product.quantity -= 1;
        this.addToOrder(product);
      }
    },
    addToOrder(product) {
      const existingItem = this.currentOrder.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.cantidad = product.quantity;
      } else if (product.quantity > 0) {
        this.currentOrder.push({ ...product, cantidad: product.quantity });
      }
      this.currentOrder = this.currentOrder.filter((item) => item.cantidad > 0);
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
      this.getActiveOrders();
    },
    getActiveOrders() {
      axios.get('https://rotiserialatriada.onrender.com/api/comandas', {
        headers: {
          Authorization: `Bearer ${this.token}` // Añadido para autenticar la solicitud
        }
      })
      .then((response) => {
        this.activeOrders = response.data.filter(
          (order) => order.estado !== 'cerrada' && order.estado !== 'cancelada'
        );
      });
    },
    createOrder(product) {
      axios
        .post('https://rotiserialatriada.onrender.com/api/comandas', {
          product_id: product.id,
          quantity: product.cantidad,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(() => {
          console.log('Comanda creada con éxito.');
          this.getActiveOrders();
        })
        .catch((error) => {
          console.error('Error al crear la comanda:', error);
        });
    },
    updateStock(product, quantity) {
      if (product.stock + quantity < 0) {
        alert('El stock no puede ser menor a cero.');
        return;
      }

      axios
        .put(`https://rotiserialatriada.onrender.com/api/productos/${product.id}`, {
          stock: product.stock + quantity,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(() => {
          this.getProducts();
        })
        .catch((error) => {
          console.error('Error al actualizar el stock:', error);
        });
    },
    deleteOrder(orderId) {
      axios
        .delete(`https://rotiserialatriada.onrender.com/api/comandas/${orderId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        .then(() => {
          console.log('Comanda eliminada con éxito.');
          this.getActiveOrders();
        })
        .catch((error) => {
          console.error('Error al eliminar la comanda:', error.response ? error.response.data : error.message);
        });
    },
  }
};
</script>

<style scoped>
/* Estilo para la barra de búsqueda con la lupa */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.search-icon {
  width: 20px;
  height: 20px;
}
</style>
