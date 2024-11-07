<template>
 
  <div class="admin-background">  <!-- Aquí aplicamos la clase -->
    <div class="logo4-container">
      <img src='../images/logorotiseria.png' alt="Logo" id="logo">
    </div>
    <h2>Pantalla Administrador/a</h2>

 <!-- Mostrar la cotización del dólar -->
 <p class="dollar-rate">Cotización del Dólar: ${{ tasaDolar }}</p>
    <!-- Contenedor principal de botones alineados -->
    <div class="buttons-container">
      <!-- Botones de cerrar sesión y Verificación de Stock -->
      <div class="button-group">
        <button @click="verificarStock" class="button-stock">Verificar Stock</button>
        <button @click="cerrarSesion" class="button-logout">Cerrar Sesión</button>
        <button @click="irAUsuarios" class="button-gestion">Gestionar Usuarios</button>
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
                
                <!-- Campo de entrada para la cantidad, editable manualmente -->
                <input type="number" v-model.number="producto.cantidad" @input="actualizarCantidadManual(producto)" min="0" :max="producto.stock" style="width: 40px; text-align: center;" :disabled="producto.stock === 0" />

                <button class="button-adjust-stock" @click="aumentarCantidad(producto)" :disabled="producto.stock === 0">+</button>
              </div>
            </li>
          </ul>
                </div>
      </div>

      <!-- Columna derecha: Comanda actual -->
      <div class="rightcomanda-column">
        <h3>Comanda actual</h3>
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
      <h3>Lista de Comandas</h3>
      <table>
        <thead>
          <tr>
            <th>Comanda</th>
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
              <button @click="verDetalleComanda(comanda.id)" class="button-detail">Ver Detalle</button>
            </td>
            <td>
              <button @click="eliminarComanda(comanda.id)" v-if="comanda.id" class="button-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para advertencia de stock agotado -->
    <div v-if="mostrarMensajeStock" class="detalle-comanda-modal">
      <h3>Stock agotado</h3>
      <p>El stock de este producto se ha agotado. Por favor, renueva el stock para continuar.</p>
      <button @click="cerrarMensajeStock" class="button-close">OK</button>
    </div>

    <!-- Modal para mostrar el detalle de la comanda -->
    <div v-if="detalleComandaVisible" class="detalle-comanda-modal">
      <h3>Detalle de Comanda #{{ detalleComandaId }}</h3>
      <ul>
        <li v-for="producto in detalleProductos" :key="producto.id">
          {{ producto.producto_nombre }} - Cantidad: {{ producto.cantidad }} - Subtotal: ${{ producto.subtotal }}
        </li>
      </ul>
      <button @click="cerrarDetalleComanda" class="button-close">Cerrar</button>
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
        if (!token) throw new Error('Token no encontrado.');
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.productos = response.data.map(producto => ({
          ...producto,
          cantidad: 0,
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
    obtenerPrecioProducto(id_producto) {
      const producto = this.productos.find(p => p.id === id_producto);
      return producto ? producto.precio : 0;
    },
    async obtenerCotizacionDolar() {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    this.tasaDolar = response.data.rates.ARS; // Guardar la tasa en `tasaDolar`
    alert(`Cotización actual del dólar: $${this.tasaDolar}`);
  } catch (error) {
    console.error('Error al obtener la cotización del dólar:', error);
   alert('Error al obtener la cotización del dólar');
  }
},
    verificarStock() {
      this.$router.push('/stock');
    },
    irAUsuarios() {
      this.$router.push('/listausuarios'); // Redirige a la pantalla de gestión de usuarios
    },
    aumentarCantidad(producto) {
      if (producto.stock === 0) {
        this.mostrarMensajeStock = true; // Muestra el mensaje de advertencia
      } else if (producto.cantidad < producto.stock) {
        producto.cantidad++;
        const item = this.comandaProductos.find(p => p.id_producto === producto.id);
        if (item) {
          item.cantidad = producto.cantidad;
        } else {
          this.comandaProductos.push({
            id_producto: producto.id,
            cantidad: producto.cantidad,
          });
        }
      }
    },
    cerrarMensajeStock() {
      this.mostrarMensajeStock = false; // Cierra el modal
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
    actualizarCantidadManual(producto) {
  // Si el campo está vacío, establece la cantidad en 0 y elimina el producto de la comanda actual.
  if (producto.cantidad === null || producto.cantidad === "") {
    producto.cantidad = 0;
    const index = this.comandaProductos.findIndex(p => p.id_producto === producto.id);
    if (index !== -1) {
      this.eliminarProductoDeComanda(index);
    }
  } else if (producto.cantidad === 0) {
    // Si el usuario ingresa 0, muestra un mensaje de advertencia y no actualiza la comanda
    alert("Ingrese un número mayor o igual a 1.");
    producto.cantidad = ""; // Limpia el campo de entrada
  } else if (producto.cantidad > producto.stock) {
    // Si la cantidad ingresada es mayor que el stock disponible, muestra un mensaje de advertencia y ajusta al stock máximo
    alert("No hay suficiente stock. La cantidad máxima es " + producto.stock + ".");
    producto.cantidad = producto.stock; // Limita la cantidad al máximo del stock
  } else {
    // Si la cantidad es válida (entre 1 y stock máximo), actualiza o agrega a la comanda actual
    const item = this.comandaProductos.find(p => p.id_producto === producto.id);
    if (item) {
      item.cantidad = producto.cantidad;
    } else {
      this.comandaProductos.push({
        id_producto: producto.id,
        cantidad: producto.cantidad,
      });
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
        cantidad: p.cantidad,
      })),
    };

    const response = await axios.post(
      'https://rotiserialatriada-dgjb.onrender.com/api/comandas',
      comandaData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const nuevaComanda = {
      id: response.data.id,
      precio_total: response.data.precio_total || this.calcularPrecioTotal(comandaData.productos),
      estado: response.data.estado || 'En proceso',
    };

    this.comandas.push(nuevaComanda);
    this.comandaProductos = [];

    comandaData.productos.forEach(p => {
      const producto = this.productos.find(prod => prod.id === p.id_producto);
      if (producto) producto.stock -= p.cantidad;
    });

    alert("Comanda confirmada exitosamente.");

    // Llama a las funciones para actualizar los productos y comandas automáticamente
    await this.obtenerProductos();
    await this.obtenerComandas();

  } catch (error) {
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
          headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    });

    alert('Comanda eliminada correctamente.');
    
    // Recargar la lista de comandas para reflejar los cambios
    await this.obtenerComandas();

  } catch (err) {
    /*console.error('Error al eliminar comanda:', err);
    alert('Error al eliminar la comanda.');*/
  }
},
    async verDetalleComanda(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token no encontrado.');

    const response = await axios.get(
      `https://rotiserialatriada-dgjb.onrender.com/api/comanda_productos/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    this.detalleProductos = response.data.map(producto => ({
      id: producto.id,
      id_comanda: producto.id_comanda,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      subtotal: producto.subtotal,
      producto_nombre: producto.producto_nombre
    }));
    this.detalleComandaId = id;
    this.detalleComandaVisible = true;
  } catch (error) {
    console.error('Error al obtener el detalle de la comanda:', error);
    alert('Error al obtener el detalle de la comanda.');
  }
},

    cerrarDetalleComanda() {
      this.detalleComandaVisible = false;
      this.detalleProductos = [];
      this.detalleComandaId = null;
    },
  },
  mounted() {
  this.obtenerProductos();
  this.obtenerComandas();
  this.obtenerCotizacionDolar(); // Obtener cotización del dólar al montar el componente
},
};
</script>