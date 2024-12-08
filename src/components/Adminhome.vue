<template>
  <div class="admin-background"> <!-- Aquí aplicamos la clase -->
    <div class="logo4-container">
      <img src='../images/logorotiseria.png' alt="Logo" id="logo">
    </div>
    <h2>Pantalla Administrador/a</h2>

    <!-- Mostrar la cotización del dólar -->
    <p class="dollar-rate">Cotización del Dólar: ${{ tasaDolar }}</p>

    <!-- Contenedor principal de botones alineados -->
    <div class="buttons-container">
      <div class="button-group">
        <button @click="verificarStock" class="button-stock">Verificar Stock</button>
        <button @click="irAUsuarios" class="button-gestion">Gestionar Usuarios</button>
        <button @click="cerrarSesion" class="button-logout">Cerrar Sesión</button>
      </div>
    </div>

    <div class="admin-container">
      <!-- Columna izquierda: Buscador y lista de productos -->
      <div class="leftproduct-column">
        <h3>Buscar productos</h3>
        <input type="text" v-model="filtro" placeholder="Filtrar productos" />

        <h4>Lista de productos</h4>
        <div class="product-list-container">
          <ul class="product-list">
            <li v-for="producto in productosFiltrados" :key="producto.id" class="product-item" :class="{ 'no-stock': producto.stock === 0 }">
              {{ producto.nombre }} - Precio: ${{ producto.precio }} - Stock: {{ producto.stock }}
              <div>
                <button class="button-adjust-stock" @click="reducirCantidad(producto)" :disabled="producto.stock === 0">-</button>
                <input type="number" v-model.number="producto.cantidad" @input="actualizarCantidadManual(producto)" min="0" :max="producto.stock" style="width: 40px; text-align: center;" :disabled="producto.stock === 0" />
                <button class="button-adjust-stock" @click="aumentarCantidad(producto)" :disabled="producto.stock === 0">+</button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Columna derecha: Comanda actual -->
      <div class="rightcomanda-column">
        <h3>Pedido actual</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in comandaProductos" :key="index">
              <td>{{ obtenerNombreProducto(producto.id_producto) }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>US${{ obtenerPrecioProducto(producto.id_producto) }}</td>
              <td>US${{ (obtenerPrecioProducto(producto.id_producto) * producto.cantidad).toFixed(2) }}</td>
              <td>
                <button @click="eliminarProductoDeComanda(index)" class="button-delete">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p>Total en Dólares: US${{ calcularTotalComanda.toFixed(2) }}</p>
        <button @click="confirmarComanda" class="button-confirm">Confirmar Comanda</button>
      </div>
    </div>

    <!-- Tabla: Lista de Comandas debajo de ambas columnas -->
    <div class="comandas-container">
      <h3>Lista de Pedidos</h3>
      <table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Precio Total</th>
            <th>Estado</th>
            <th>Detalle</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comanda in comandas" :key="comanda.id">
            <td>{{ comanda.id }}</td>
            <td>${{ comanda.precio_total }}</td>
            <td>{{ comanda.estado }}</td>
            <td>
              <!-- Muestra el detalle automáticamente sin el botón -->
              <ul>
                <li v-for="producto in comanda.detalleProductos" :key="producto.id">
                  <strong>{{ producto.nombre }}</strong> - Cantidad: {{ producto.cantidad }} - Precio: ${{ producto.precio }} - Subtotal: ${{ producto.subtotal }}
                </li>
              </ul>
            </td>
            <td>
              <button @click="eliminarComanda(comanda.id)" v-if="comanda.id" class="button-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
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
      error: '',
      detalleComandaId: null,
      detalleProductos: [],
      detalleComandaVisible: false,
      mostrarMensajeStock: false,
      tasaDolar: 0,
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
    },
    calcularTotalComanda() {
      return this.comandaProductos.reduce((total, producto) => {
        const precio = this.obtenerPrecioProducto(producto.id_producto);
        return total + (precio * producto.cantidad);
      }, 0);
    },
    totalEnPesos() {
      return this.calcularTotalComanda * this.tasaDolar;
    }
  },
  methods: {
    cerrarSesion() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      this.$router.push('/login');
    },
    async obtenerProductos() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Se asume que el formato ya es un array de productos como se mostró
        this.productos = response.data.map(producto => ({
          ...producto,
          cantidad: 0
        }));
      } catch (err) {
        console.error('Error al obtener productos:', err);
      }
    },
    obtenerNombreProducto(id_producto) {
      const producto = this.productos.find(p => p.id === id_producto);
      return producto ? producto.nombre : 'Producto desconocido';
    },
    obtenerPrecioProducto(id_producto) {
      const producto = this.productos.find(p => p.id === id_producto);
      return producto ? parseFloat(producto.precio) : 0;
    },
    async obtenerCotizacionDolar() {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        this.tasaDolar = response.data.rates.ARS;
      } catch (error) {
        console.error('Error al obtener la cotización del dólar:', error);
      }
    },
    verificarStock() {
      this.$router.push('/stock');
    },
    irAUsuarios() {
      this.$router.push('/listausuarios');
    },
    aumentarCantidad(producto) {
  if (producto.stock > producto.cantidad) {
    producto.cantidad++;
    
    // Buscar si el producto ya está en la comanda
    const itemEnComanda = this.comandaProductos.find(p => p.id_producto === producto.id);

    if (itemEnComanda) {
      itemEnComanda.cantidad = producto.cantidad;
    } else {
      // Si no está, lo añadimos
      this.comandaProductos.push({
        id_producto: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio
      });
    }
  }
},
    cerrarMensajeStock() {
      this.mostrarMensajeStock = false;
    },
    reducirCantidad(producto) {
  if (producto.cantidad > 0) {
    producto.cantidad--;

    const itemEnComanda = this.comandaProductos.find(p => p.id_producto === producto.id);
    if (itemEnComanda) {
      if (producto.cantidad === 0) {
        // Si la cantidad llega a 0, lo eliminamos de la comanda
        this.comandaProductos = this.comandaProductos.filter(p => p.id_producto !== producto.id);
      } else {
        itemEnComanda.cantidad = producto.cantidad;
      }
    }
  }
},
    actualizarCantidadManual(producto) {
      if (producto.cantidad > producto.stock) {
        alert("Cantidad mayor al stock disponible");
        producto.cantidad = producto.stock;
      }
    },
    async confirmarComanda() {
      try {
        const token = localStorage.getItem('token');
        const comandaData = {
          productos: this.comandaProductos.map(p => ({
            producto_id: p.id_producto,
            cantidad: p.cantidad
          }))
        };

        const response = await axios.post(
          'https://rotiserialatriada-dgjb.onrender.com/api/pedidos',
          comandaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          this.comandas.push({
            id: response.data.id,
            precio_total: response.data.precio_total,
            estado: response.data.estado,
            productos: response.data.productos
          });
          this.comandaProductos = [];
          alert("Pedido confirmado exitosamente.");
          await this.obtenerProductos();
          await this.obtenerComandas();
        } else {
          alert('Error al confirmar el pedido.');
        }
      } catch (error) {
        console.error('Error al confirmar el pedido:', error);
      }
    },
    async obtenerComandas() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Cargar productos de la API una vez para reducir las consultas
    await this.obtenerProductos();
    
    // Agregar detalles a cada producto de la comanda
    this.comandas = response.data.map(comanda => ({
      ...comanda,
      detalleProductos: comanda.productos.map(p => {
        const producto = this.productos.find(prod => prod.id === p.id);
        return {
          id: p.id,
          nombre: producto ? producto.nombre : 'Producto desconocido',
          cantidad: p.cantidad,
          precio: producto ? producto.precio : 0,
          subtotal: producto ? p.cantidad * producto.precio : 0
        };
      })
    }));
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
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
    async eliminarComanda(id) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://rotiserialatriada-dgjb.onrender.com/api/pedidos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.comandas = this.comandas.filter(comanda => comanda.id !== id);
        alert('Comanda eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar el pedido:', err);
      }
    },
    async verDetalleComanda(id) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://rotiserialatriada-dgjb.onrender.com/api/pedidos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          // Procesamos los productos con los subtotales
          this.detalleProductos = response.data.productos.map(prod => ({
            id: prod.id,
            cantidad: prod.cantidad,
            subtotal: prod.subtotal
          }));
          this.detalleComandaId = id;
          this.detalleComandaVisible = true;
        } else {
          console.error('No se encontró el detalle del pedido.');
        }
      } catch (error) {
        console.error('Error al obtener detalle del pedido:', error);
      }
    }
  },
  async obtenerProductoPorId(idProducto) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://rotiserialatriada-dgjb.onrender.com/api/productos/${idProducto}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data; // Retorna el producto completo con los detalles necesarios
    } catch (error) {
      console.error(`Error al obtener detalles del producto con ID ${idProducto}:`, error);
      return {}; // Retorna un objeto vacío si hay un error
    }
  },
cerrarDetalleComanda() {
  this.detalleComandaVisible = false;
  this.detalleProductos = [];
  this.detalleComandaId = null; // Restablecer el ID para evitar referencias
},
  async mounted() {
    await this.obtenerProductos();
    await this.obtenerComandas();
    await this.obtenerCotizacionDolar();
  }
}
</script> 
