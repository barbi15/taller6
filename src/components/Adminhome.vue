<template>
  <div>
    <h2>Inicio administrador</h2>

    <!-- Formulario para agregar productos a la comanda -->
    <form @submit.prevent="agregarProductoAComanda">
      <div>
        <label for="producto">Producto</label>
        <select v-model="nuevaComanda.id_producto" required>
          <option v-for="producto in productos" :key="producto.id" :value="producto.id">
            {{ producto.nombre }} - Stock: {{ producto.stock }}
          </option>
        </select>
      </div>
      <div>
        <label for="cantidad">Cantidad</label>
        <input type="number" v-model="nuevaComanda.cantidad" min="1" required />
      </div>
      <button type="submit">Agregar Producto</button>
      <button @click.prevent="crearComanda">Crear Comanda</button>
      <button @click.prevent="irAStock">Verificar Stock</button>
    </form>

    <!-- Lista de productos añadidos a la comanda -->
    <div v-if="comandaProductos.length > 0">
      <h3>Productos en la Comanda</h3>
      <ul>
        <li v-for="(producto, index) in comandaProductos" :key="index">
          {{ obtenerNombreProducto(producto.id_producto) }} - Cantidad: {{ producto.cantidad }}
        </li>
      </ul>
    </div>

    <!-- Formulario para crear un nuevo producto -->
    <h3>Crear nuevo producto</h3>
    <form @submit.prevent="crearProducto">
      <div>
        <label for="nombre">Nombre del producto</label>
        <input type="text" v-model="nuevoProducto.nombre" required />
      </div>
      <div>
        <label for="stock">Stock</label>
        <input type="number" v-model="nuevoProducto.stock" min="1" required />
      </div>
      <div>
        <label for="precio">Precio</label>
        <input type="number" step="0.01" v-model="nuevoProducto.precio" required />
      </div>
      <button type="submit">Crear Producto</button>
    </form>

    <!-- Mostrar errores -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Tabla de comandas -->
    <h3>Lista de Comandas</h3>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comanda in comandas" :key="comanda.id">
          <td>{{ obtenerNombreProducto(comanda.id_producto) }}</td>
          <td>{{ comanda.cantidad }}</td>
          <td>{{ comanda.precio_total }}</td>
          <td><button @click="eliminarComanda(comanda.id)">Eliminar</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      productos: [],          // Lista de productos
      comandas: [],           // Lista de comandas
      comandaProductos: [],   // Productos seleccionados para la comanda
      nuevaComanda: {
        id_producto: '',      // Producto seleccionado
        cantidad: 1           // Cantidad del producto
      },
      nuevoProducto: {         // Datos del nuevo producto
        nombre: '',
        stock: 1,
        precio: '0.00'
      },
      error: ''               // Error para mostrar mensajes
    };
  },
  methods: {
    // Obtener productos disponibles desde el backend
    async obtenerProductos() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.productos = response.data;
      } catch (err) {
        console.error('Error al obtener productos:', err);
        this.error = 'Error al obtener productos.';
      }
    },

    // Agregar producto seleccionado a la comanda
    agregarProductoAComanda() {
      if (this.nuevaComanda.cantidad > 0 && this.nuevaComanda.id_producto) {
        this.comandaProductos.push({ ...this.nuevaComanda });
        this.nuevaComanda = { id_producto: '', cantidad: 1 }; // Limpiar selección
      } else {
        this.error = 'Debes seleccionar un producto y una cantidad válida.';
      }
    },

    // Crear comanda enviando productos seleccionados al backend
    async crearComanda() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        // Preparamos los productos para la comanda
        const comandaData = {
          productos: this.comandaProductos.map(p => ({
            id_producto: p.id_producto,
            cantidad: p.cantidad
          }))
        };

        // Enviamos la comanda al servidor
        const response = await axios.post(
          'https://rotiserialatriada-dgjb.onrender.com/api/comandas',
          comandaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Actualizar lista de comandas
        this.comandas.push(response.data);
        this.comandaProductos = [];  // Limpiar los productos seleccionados
      } catch (err) {
        console.error('Error al crear comanda:', err);
        this.error = 'Error al crear comanda.';
      }
    },

    // Crear nuevo producto
    async crearProducto() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');

        // Preparamos el producto a enviar
        const productoData = {
          nombre: this.nuevoProducto.nombre,
          stock: this.nuevoProducto.stock,
          precio: parseFloat(this.nuevoProducto.precio).toFixed(2)
        };

        // Enviamos el nuevo producto al servidor
        await axios.post('https://rotiserialatriada-dgjb.onrender.com/api/productos', productoData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Actualizamos la lista de productos
        this.obtenerProductos();

        // Limpiamos el formulario de nuevo producto
        this.nuevoProducto = { nombre: '', stock: 1, precio: '0.00' };
        this.error = '';
      } catch (err) {
        console.error('Error al crear el producto:', err);
        this.error = 'Error al crear el producto.';
      }
    },

    // Obtener lista de comandas creadas desde el backend
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

    // Eliminar una comanda por ID
    async eliminarComanda(id) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado.');
        await axios.delete(`https://rotiserialatriada-dgjb.onrender.com/api/comandas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.obtenerComandas(); // Actualizar lista tras eliminar
      } catch (err) {
        console.error('Error al eliminar comanda:', err);
        this.error = 'Error al eliminar comanda.';
      }
    },

    // Obtener el nombre del producto por su ID
    obtenerNombreProducto(id_producto) {
      const producto = this.productos.find(p => p.id === id_producto);
      return producto ? producto.nombre : 'Producto desconocido';
    }
  },
  mounted() {
    // Autenticación y carga de datos al montar el componente
    this.obtenerProductos();
    this.obtenerComandas();
  }
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>
