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
      comandas: [] // Arreglo para almacenar las comandas
    };
  },
  mounted() {
    this.getComandas(); // Llamar a getComandas al montar el componente
  },
  methods: {
    getComandas() {
      const token = localStorage.getItem('token'); // Recuperar el token de localStorage

      if (!token) {
        console.error('No se encontró el token. No se puede autenticar la solicitud.');
        return;
      }

      axios.get('https://rotiserialatriada-dgjb.onrender.com/api/comandas', {
        headers: {
          Authorization: `Bearer ${token}` // Incluir el token en la solicitud
        }
      })
      .then(response => {
        // Verifica si la respuesta tiene datos y ajusta la estructura según lo esperado
        this.comandas = response.data;
      })
      .catch(error => {
        console.error('Error al obtener las comandas:', error.response ? error.response.data : error.message);
      });
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
