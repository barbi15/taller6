<template>
  <div>
    <h2>Inicio administrador</h2>

    <!-- Formulario para agregar productos -->
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

    <!-- Tabla de comandas ya creadas -->
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
          <td>
            <button @click="eliminarComanda(comanda.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      productos: [], // Lista de productos desde el backend
      comandas: [], // Lista de comandas ya creadas
      comandaProductos: [], // Productos agregados a la nueva comanda
      nuevaComanda: {
        id_producto: '',
        cantidad: 1
      },
      error: ''
    };
  },
  methods: {
    async obtenerProductos() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token no encontrado.");
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.productos = response.data;
      } catch (err) {
        console.error('Error al obtener los productos', err);
        this.error = 'Error al obtener los productos.';
      }
    },

    async obtenerComandas() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token no encontrado.");
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/comandas', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.comandas = response.data;
      } catch (err) {
        console.error('Error al obtener las comandas', err);
        this.error = 'Error al obtener las comandas.';
      }
    },

    obtenerNombreProducto(id_producto) {
      const producto = this.productos.find(producto => producto.id === id_producto);
      return producto ? producto.nombre : 'Producto desconocido';
    },

    agregarProductoAComanda() {
      if (this.nuevaComanda.cantidad > 0) {
        // Agregar el producto a la lista de productos de la comanda
        this.comandaProductos.push({ ...this.nuevaComanda });
        this.nuevaComanda = { id_producto: '', cantidad: 1 }; // Resetear el formulario
        this.error = '';
      } else {
        this.error = 'La cantidad debe ser mayor a 0.';
      }
    },

    async crearComanda() {
      try {
        if (this.comandaProductos.length === 0) {
          this.error = 'Debes agregar al menos un producto a la comanda.';
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token no encontrado.");

        // Estructura del JSON que se enviará
        const comandaData = {
          productos: this.comandaProductos
        };

        // Enviar la comanda al backend
        const response = await axios.post('https://rotiserialatriada-dgjb.onrender.com/api/comandas', comandaData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.obtenerComandas(); // Actualizar la lista de comandas
        this.comandaProductos = []; // Vaciar la lista de productos
        this.error = '';
      } catch (err) {
        console.error('Error al crear la comanda', err);
        this.error = err.response?.data || 'Error al crear la comanda.';
      }
    },

    async eliminarComanda(id) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token no encontrado.");
        await axios.delete(`https://rotiserialatriada-dgjb.onrender.com/api/comandas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.obtenerComandas();
      } catch (err) {
        console.error('Error al eliminar la comanda', err);
        this.error = 'Error al eliminar la comanda.';
      }
    },

    irAStock() {
      this.$router.push({ name: 'stock' }).catch(err => {
        console.error("Error al redirigir a la página de stock:", err);
        this.error = "No se pudo redirigir a la página de stock.";
      });
    }
  },
  mounted() {
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
