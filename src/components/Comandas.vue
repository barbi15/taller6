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

    <!-- Mostrar errores -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Tabla de comandas -->
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
          <td>{{ comanda.precio_total }}</td>
          <td>{{ comanda.estado }}</td>
          <td>
            <button @click="eliminarComanda(comanda.id)">Eliminar</button>
          </td>
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
      productos: [],
      comandas: [],
      comandaProductos: [],
      nuevaComanda: {
        id_producto: null,
        cantidad: 1
      },
      error: ''
    };
  },
  mounted() {
    this.getProductos();
    this.getComandas();
  },
  methods: {
    // Obtener productos del backend
    async getProductos() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no encontrado.');
        return;
      }

      try {
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/productos', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.success) {
          this.productos = response.data.data.map(producto => ({
            ...producto,
            cantidad: 0
          }));
        }
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    },

    // Obtener comandas del backend
    async getComandas() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No se encontró el token.');
        return;
      }

      try {
        const response = await axios.get('https://rotiserialatriada-dgjb.onrender.com/api/pedidos', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.success) {
          this.comandas = response.data.data;
        } else {
          console.error('Error al obtener las comandas:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener las comandas:', error);
      }
    },

    // Agregar productos a la comanda
    agregarProductoAComanda() {
      if (this.nuevaComanda.id_producto && this.nuevaComanda.cantidad > 0) {
        const productoExistente = this.comandaProductos.find(
          p => p.id_producto === this.nuevaComanda.id_producto
        );

        if (productoExistente) {
          productoExistente.cantidad += this.nuevaComanda.cantidad;
        } else {
          this.comandaProductos.push({ ...this.nuevaComanda });
        }
      }
    },

    // Confirmar comanda
    async crearComanda() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token no encontrado. Por favor, inicie sesión.');
        return;
      }

      const comandaData = {
        productos: this.comandaProductos.map(p => ({
          producto_id: p.id_producto,
          cantidad: p.cantidad
        }))
      };

      try {
        const response = await axios.post(
          'https://rotiserialatriada-dgjb.onrender.com/api/pedidos',
          comandaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.success) {
          alert('Comanda creada exitosamente.');
          this.getComandas();
          this.comandaProductos = [];
        } else {
          alert('Error al crear la comanda.');
        }
      } catch (error) {
        console.error('Error al crear comanda:', error);
        alert('Error al confirmar la comanda.');
      }
    },

    // Eliminar comanda
    async eliminarComanda(id) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token no encontrado.');
        return;
      }

      try {
        const response = await axios.delete(`https://rotiserialatriada-dgjb.onrender.com/api/pedidos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.success) {
          alert('Comanda eliminada exitosamente.');
          this.getComandas();
        } else {
          alert('Error al eliminar la comanda.');
        }
      } catch (error) {
        console.error('Error al eliminar comanda:', error);
        alert('Error al eliminar la comanda.');
      }
    },

    // Obtener nombre del producto por ID
    obtenerNombreProducto(id_producto) {
      const producto = this.productos.find(p => p.id === id_producto);
      return producto ? producto.nombre : 'Producto no encontrado';
    }
  }
};
</script>

<style scoped>
/* Estilos personalizados para la lista de comandas */
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>
