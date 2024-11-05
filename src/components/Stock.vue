<template>
  <div class="stock-management-container">
    <h1>Gestión de Stock</h1>

    <!-- Buscador de productos -->
    <div class="stock-search-bar">
      <input v-model="searchQuery" placeholder="Buscar producto..." />
    </div>

    <!-- Campo y botón para agregar un nuevo producto -->
    <div class="stock-add-product-section">
      <label for="productName">Nuevo producto:</label>
      <input v-model="newProductName" id="productName" placeholder="Nombre del nuevo producto" class="stock-add-input" />
      
      <label for="productPrice">Precio:</label>
      <input v-model.number="newProductPrice" id="productPrice" placeholder="Precio" class="stock-add-input" />
      
      <label for="productStock">Stock:</label>
      <input v-model.number="newProductStock" id="productStock" placeholder="Stock inicial" class="stock-add-input" />
      
      <button class="stock-add-button" @click="agregarProducto">Agregar Producto</button>
    </div>

    <!-- Lista de Productos -->
    <div class="stock-product-list-container">
      <ul class="stock-product-list">
        <li v-for="product in filteredProducts" :key="product.id" class="stock-product-item">
          <div class="stock-product-details">
            <span>{{ product.nombre }}</span> - ${{ product.precio }} (Stock: {{ product.stock }})
          </div>
          <div class="stock-product-actions">
            <button @click="updateStock(product, -1)" class="stock-adjust-button">-</button>
            <span class="stock-quantity-display">{{ product.stock }}</span>
            <button @click="updateStock(product, 1)" class="stock-adjust-button">+</button>
            <button @click="eliminarProducto(product.id)" class="stock-delete-button">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Botón de volver -->
    <div class="stock-action-buttons">
      <button class="stock-back-button" @click="volver">Volver a Admin Home</button>
    </div>
  </div>
</template>


<script>
import '../styles/Stock.css';
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      searchQuery: '',
      newProductName: '',
      newProductPrice: 0,
      newProductStock: 0,
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) =>
        product.nombre && product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    this.getProducts();
  },
  methods: {
    getProducts() {
      const token = localStorage.getItem('token');
      axios
        .get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          this.products = response.data;
        })
        .catch((error) => {
          console.error('Error al obtener productos:', error);
        });
    },

    // Actualiza el stock de un producto
    updateStock(product, change) {
      if (product.stock + change < 0) {
        alert('El stock no puede ser menor a cero.');
        return;
      }

      const token = localStorage.getItem('token');
      const updatedProduct = {
        nombre: product.nombre,
        precio: product.precio,
        stock: product.stock + change,
      };

      axios
        .put(`https://rotiserialatriada-dgjb.onrender.com/api/productos/${product.id}`, updatedProduct, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          product.stock += change;
          console.log(`Stock actualizado: ${product.nombre} - ${product.stock}`);
          this.getProducts(); // Actualiza la lista de productos
        })
        .catch((error) => {
          console.error('Error al actualizar el stock:', error);
        });
    },

    // Agrega un nuevo producto al backend
    agregarProducto() {
      if (!this.newProductName || isNaN(this.newProductPrice) || isNaN(this.newProductStock)) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
      }

      const nuevoProducto = {
        nombre: this.newProductName,
        precio: this.newProductPrice.toFixed(2),
        stock: this.newProductStock,
      };

      const token = localStorage.getItem('token');
      axios
        .post('https://rotiserialatriada-dgjb.onrender.com/api/productos', nuevoProducto, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          this.products.push(response.data);
          this.newProductName = '';
          this.newProductPrice = 0;
          this.newProductStock = 0;
          alert('Producto agregado exitosamente.');
          this.getProducts(); // Actualiza la lista de productos
        })
        .catch((error) => {
          console.error('Error al agregar el producto:', error);
        });
    },

    // Elimina un producto del backend
    eliminarProducto(productId) {
      const token = localStorage.getItem('token');
      axios
        .delete(`https://rotiserialatriada-dgjb.onrender.com/api/productos/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          this.products = this.products.filter(product => product.id !== productId);
          alert('Producto eliminado exitosamente.');
        })
        .catch((error) => {
          console.error('Error al eliminar el producto:', error);
        });
    },

    // Guarda cambios en productos nuevos y actualizaciones de stock
    guardarCambios() {
      const token = localStorage.getItem('token');
      const updatePromises = this.products.map((product) => {
        const productData = {
          nombre: product.nombre,
          precio: product.precio,
          stock: product.stock,
          
        };
        
        if (product.id) {
          // Actualiza productos existentes
          return axios.put(
            `https://rotiserialatriada-dgjb.onrender.com/api/productos/${product.id}`,
            productData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Crea productos nuevos
          return axios.post('https://rotiserialatriada-dgjb.onrender.com/api/productos', productData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      });

      Promise.all(updatePromises)
        .then(() => {
          alert('Cambios guardados exitosamente.');
          this.getProducts();
        })
        .catch((error) => {
          console.error('Error al guardar cambios:', error);
          alert('Error al guardar cambios. Intente nuevamente.');
        });
    },

    volver() {
      this.$router.push('/Adminhome');
    },
  },
};
</script>
