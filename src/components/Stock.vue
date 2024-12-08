<template>
  <div class="logo2-container">
    <div class="stock-page-background">
      <div class="stock-management-container">
        <img src='../images/logorotiseria.png' alt="Logo" id="logo">
        <h1>Gestión de Stock</h1>
      </div>

      <!-- Buscador de productos -->
      <div class="stock-search-bar">
        <input v-model="searchQuery" placeholder="Buscar producto..." />
      </div>

      <!-- Campo y botón para agregar un nuevo producto -->
      <div class="stock-add-product-section">
        <label for="productName">Nuevo producto:</label>
        <input v-model="newProductName" id="productName" placeholder="Nombre del nuevo producto" class="stock-add-input" />
        
        <!-- campo precio y stock -->
        <label for="productPrice">Precio:</label>
        <input 
          v-model.number="newProductPrice" 
          id="productPrice" 
          type="number" 
          min="0" 
          step="0.01" 
          placeholder="Precio" 
          class="stock-add-input" 
        />
        
        <label for="productStock">Stock:</label>
        <input 
          v-model.number="newProductStock" 
          id="productStock" 
          type="number" 
          min="0" 
          step="1" 
          placeholder="Stock inicial" 
          class="stock-add-input" 
        />
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
              <button @click="updatePrice(product)" class="stock-adjust-button5">Actualizar Precio</button>
              <button @click="eliminarProducto(product.id)" class="stock-delete-button">Eliminar</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Botón de volver -->
      <div class="stock-action-buttons">
        <button class="stock-back-button" @click="volver">Volver al Inicio</button>
      </div>
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
          if (Array.isArray(response.data)) {
            this.products = response.data;
          } else {
            console.error('Formato de respuesta inesperado:', response.data);
            alert('Error al obtener productos. Formato de respuesta no válido.');
          }
        })
        .catch((error) => {
          console.error('Error al obtener productos:', error);
          alert('Error al obtener productos.');
        });
    },
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
        .patch(`https://rotiserialatriada-dgjb.onrender.com/api/productos/${product.id}`, updatedProduct, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          product.stock += change;
          this.getProducts(); // Actualiza la lista de productos
        })
        .catch((error) => {
          console.error('Error al actualizar el stock:', error);
          alert('Error al actualizar el stock.');
        });
    },
    updatePrice(product) {
      const nuevoPrecio = prompt("Ingrese el nuevo precio para el producto", product.precio);
      
      if (nuevoPrecio && !isNaN(nuevoPrecio) && parseFloat(nuevoPrecio) > 0) {
        const token = localStorage.getItem('token');

        if (!token) {
          alert('Token no encontrado. Por favor, inicie sesión nuevamente.');
          return;
        }

        const updatedProduct = {
          nombre: product.nombre,
          precio: parseFloat(nuevoPrecio),
          stock: product.stock,
        };

        axios.patch(
          `https://rotiserialatriada-dgjb.onrender.com/api/productos/${product.id}`,
          updatedProduct,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response) => {
          product.precio = parseFloat(nuevoPrecio);
          alert(`Precio actualizado a $${nuevoPrecio} exitosamente.`);
          this.getProducts(); // Actualiza la lista de productos
        })
        .catch((error) => {
          console.error('Error al actualizar el precio:', error);
          if (error.response && error.response.status === 401) {
            alert('No autorizado. Por favor, inicie sesión nuevamente.');
          } else {
            alert('Error al actualizar el precio. Intente nuevamente.');
          }
        });
      } else {
        alert('El precio ingresado no es válido.');
      }
    },
    agregarProducto() {
  if (
    !this.newProductName ||
    isNaN(this.newProductPrice) || this.newProductPrice <= 0 ||
    isNaN(this.newProductStock) || this.newProductStock <= 0
  ) {
    alert('Por favor, complete todos los campos con valores numéricos válidos.');
    return;
  }

  const nuevoProducto = {
    nombre: this.newProductName,
    precio: parseFloat(this.newProductPrice.toFixed(2)),
    stock: this.newProductStock,
  };

  const token = localStorage.getItem('token');
  axios
    .post('https://rotiserialatriada-dgjb.onrender.com/api/productos', nuevoProducto, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      if (response.status === 201) {
        this.getProducts(); // Actualiza la lista de productos
        alert('Producto agregado exitosamente.');

        // Limpiar los campos después de agregar el producto
        this.newProductName = '';
        this.newProductPrice = 0;
        this.newProductStock = 0;
      } else {
        console.error('Error al agregar producto:', response.data);
        alert('Error al agregar producto.');
      }
    })
    .catch((error) => {
      console.error('Error al agregar el producto:', error);
      alert('Error al agregar producto.');
    });
},
    eliminarProducto(productId) {
      const token = localStorage.getItem('token');
      axios
        .delete(`https://rotiserialatriada-dgjb.onrender.com/api/productos/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          this.products = this.products.filter(product => product.id !== productId);
          alert('Producto eliminado exitosamente.');
          this.getProducts(); // Actualiza la lista de productos
        })
        .catch((error) => {
          console.error('Error al eliminar el producto:', error);
          alert('Error al eliminar producto.');
        });
    },
    volver() {
      this.$router.push('/Adminhome');
    },
  },
};
</script>
