<template>
  <h2>Pantalla Administrador/a</h2>

  <!-- Botón para redirigir al perfil de administrador -->
  <div class="button-container">
    <button @click="verPerfil" class="profile-button">Ver Perfil</button>
  </div>

  <!-- Botones de Cotización y Verificación de Stock -->
  <div class="button-container">
    <button @click="obtenerCotizacionDolar" class="dollar-button">Cotización del Dólar</button>
    <button @click="verificarStock" class="stock-button">Verificar Stock</button>
  </div>

  <div class="admin-container">
    <!-- Columna izquierda: Buscador y lista de productos -->
    <div class="left-column">
      <h2>Buscar productos</h2>
      <input type="text" v-model="filtro" placeholder="Filtrar productos" />

      <h3>Lista de productos</h3>
      <ul>
        <li v-for="producto in productosFiltrados" :key="producto.id">
          {{ producto.nombre }} - Precio: ${{ producto.precio }} - Stock: {{ producto.stock }}
          <div>
            <button @click="reducirCantidad(producto)">-</button>
            {{ producto.cantidad }}
            <button @click="aumentarCantidad(producto)">+</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Columna derecha: Comanda actual -->
    <div class="right-column">
      <h3>Comanda actual</h3>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in comandaProductos" :key="index">
            <td>{{ obtenerNombreProducto(producto.id_producto) }}</td>
            <td>{{ producto.cantidad }}</td>
            <td>
              <button @click="eliminarProductoDeComanda(index)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="confirmarComanda">Confirmar Comanda</button>
    </div>
  </div>

  <!-- Tabla: Lista de Comandas debajo de ambas columnas -->
  <div class="comandas-container">
    <h3>Lista de Comandas</h3>
    <table>
      <thead>
        <tr>
          <th>Comanda</th>
          <th>Precio Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comanda in comandas" :key="comanda.id">
          <td>{{ comanda.id }}</td>
          <td>${{ comanda.precio_total }}</td>
          <td>{{ comanda.estado }}</td>
          <td>
            <button @click="eliminarComanda(comanda.id)" v-if="comanda.id">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <footer class="footer">
    <p>&copy; 2024 Rotisería La Triada. Todos los derechos reservados.</p>
  </footer>
</template>

<script>
import axios from 'axios';
import '../styles/Admin.css';

export default {
  data() {
    return {
      productos: [],
      comandas: [],
      comandaProductos: [],
      filtro: '',
      error: ''
    };
  },
  computed: {
    productosFiltrados() {
      if (!this.filtro) {
        return this.productos;
      }
      const filtroEnMinusculas = this.filtro.toLowerCase();
      return this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(filtroEnMinusculas)
      );
    }
  },
  methods: {
    verPerfil() {
      this.$router.push('/adminprofile');
    },
    async obtenerProductos() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.productos = response.data.map(producto => ({
          ...producto,
          cantidad: 0
        }));
      } catch (err) {
        console.error('Error al obtener productos:', err);
        this.error = 'Error al obtener productos.';
      }
    },
    obtenerNombreProducto(id_producto) {
      const producto = this.productos.find(p => p.id === id_producto);
      return producto ? producto.nombre : 'Producto desconocido';
    },
    async obtenerCotizacionDolar() {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const tasaDolar = response.data.rates.ARS;
        alert(`Cotización actual del dólar: $${tasaDolar}`);
      } catch (error) {
        console.error('Error al obtener la cotización del dólar:', error);
        alert('Error al obtener la cotización del dólar');
      }
    },
    verificarStock() {
      this.$router.push('/stock');
    },
    aumentarCantidad(producto) {
      if (producto.cantidad < producto.stock) {
        producto.cantidad++;
        const item = this.comandaProductos.find(p => p.id_producto === producto.id);
        if (item) {
          item.cantidad = producto.cantidad;
        } else {
          this.comandaProductos.push({
            id_producto: producto.id,
            cantidad: producto.cantidad
          });
        }
      }
    },
    reducirCantidad(producto) {
      if (producto.cantidad > 0) {
        producto.cantidad--;
        const item = this.comandaProductos.find(p => p.id_producto === producto.id);
        if (item) {
          if (producto.cantidad === 0) {
            this.eliminarProductoDeComanda(this.comandaProductos.indexOf(item));
          } else {
            item.cantidad = producto.cantidad;
          }
        }
      }
    },
    eliminarProductoDeComanda(index) {
      const producto = this.comandaProductos[index];
      const productoOriginal = this.productos.find(p => p.id === producto.id_producto);
      if (productoOriginal) {
        productoOriginal.cantidad = 0;
      }
      this.comandaProductos.splice(index, 1);
    },
    async confirmarComanda() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        const comandaData = {
          productos: this.comandaProductos.map(p => ({
            id_producto: p.id_producto,
            cantidad: p.cantidad
          }))
        };

        const response = await axios.post(
          'https://rotiserialatriada-dgjb.onrender.com/api/comandas',
          comandaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const nuevaComanda = {
          id: response.data.id,
          precio_total: response.data.precio_total || this.calcularPrecioTotal(comandaData.productos),
          estado: response.data.estado || 'En proceso'
        };

        this.comandas.push(nuevaComanda);
        this.comandaProductos = [];

        comandaData.productos.forEach(p => {
          const producto = this.productos.find(prod => prod.id === p.id_producto);
          if (producto) producto.stock -= p.cantidad;
        });

        alert("Comanda confirmada exitosamente.");
      } catch (error) {
        console.error('Error al confirmar comanda:', error);
        alert('Error al confirmar la comanda.');
      }
    },
    calcularPrecioTotal(productos) {
      return productos.reduce((total, producto) => {
        const item = this.productos.find(p => p.id === producto.id_producto);
        return item ? total + item.precio * producto.cantidad : total;
      }, 0);
    },
    async obtenerComandas() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/comandas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.comandas = response.data;
      } catch (err) {
        console.error('Error al obtener comandas:', err);
        this.error = 'Error al obtener comandas.';
      }
    },
    async eliminarComanda(id) {
      try {
        if (!id) {
          console.error('Error: id de comanda no definido');
          alert('Error: id de comanda no definido');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        await axios.delete(`https://rotiserialatriada-dgjb.onrender.com/api/comandas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.comandas = this.comandas.filter(comanda => comanda.id !== id);
        alert('Comanda eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar comanda:', err);
        alert('Error al eliminar la comanda.');
      }
    }
  },
  mounted() {
    this.obtenerProductos();
    this.obtenerComandas();
  }
};
</script>

<style scoped>
.profile-button {
  background-color: #007bff;
  color: rgb(236, 228, 228);
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

.profile-button:hover {
  background-color: #0056b3;
}
</style>
