<template>
  <div>
    <h2>Inicio administrador</h2>

    <form @submit.prevent="crearComanda">
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
      <button type="submit">Crear Comanda</button>
      <button @click.prevent="irAStock">Verificar Stock</button> <!-- Botón para ir a la página de stock -->
    </form>

    <div v-if="error" class="error">
      {{ error }}
    </div>

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
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router'; // Importar useRouter para la navegación

export default {
  data() {
    return {
      productos: [],
      comandas: [],
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
        const response = await axios.get('https://rotiserialatriada-lsyn.onrender.com/api/productos');
        this.productos = response.data;
      } catch (err) {
        console.error('Error al obtener los productos', err);
        this.error = 'Error al obtener los productos.';
      }
    },
    async obtenerComandas() {
      try {
        const response = await axios.get('https://rotiserialatriada-lsyn.onrender.com/api/comandas');
        this.comandas = response.data;
      } catch (err) {
        console.error('Error al obtener las comandas', err);
        this.error = 'Error al obtener las comandas.';
      }
    },
    obtenerNombreProducto(id) {
      const producto = this.productos.find(producto => producto.id === id);
      return producto ? producto.nombre : 'Producto no disponible';
    },
    async crearComanda() {
      try {
        // Validar cantidad antes de enviar
        if (this.nuevaComanda.cantidad <= 0) {
          this.error = 'La cantidad debe ser mayor a 0.';
          return;
        }
        
        // Enviar la nueva comanda al backend
        const response = await axios.post('https://rotiserialatriada-lsyn.onrender.com/api/comandas', this.nuevaComanda);
        console.log('Comanda creada:', response.data);
        
        // Obtener la lista actualizada de comandas
        this.obtenerComandas();
        // Resetear el formulario
        this.nuevaComanda = { id_producto: '', cantidad: 1 };
        this.error = ''; // Limpiar errores
      } catch (err) {
        console.error('Error al crear la comanda', err);
        // Manejar errores de respuesta
        if (err.response && err.response.data) {
          this.error = err.response.data; // Mensaje de error desde el backend
        } else {
          this.error = 'Error al crear la comanda.';
        }
      }
    },
    async eliminarComanda(id) {
      try {
        await axios.delete(`https://rotiserialatriada-lsyn.onrender.com/api/comandas/${id}`);
        this.obtenerComandas();
      } catch (err) {
        console.error('Error al eliminar la comanda', err);
        this.error = 'Error al eliminar la comanda.';
      }
    },
    irAStock() {
      // Redirigir a la página de stock
      this.$router.push({ name: 'stock' }); // Asegúrate de que 'Stock' coincida con el nombre de tu ruta
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
