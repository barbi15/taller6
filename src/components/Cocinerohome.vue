<template>
  <div class="cocinero-home">
    <h1>Pantalla del Cocinero</h1>

    <div class="logo3-container">
      <img src="../images/logorotiseria.png" alt="Logo" id="logo" />
    </div>
    <div class="top-buttons">
      <button @click="irAPerfilCocinero" class="perfil-button">Ver Perfil</button>
      <button @click="cerrarSesion" class="cerrarsesion-button">Cerrar Sesión</button>
    </div>

    <div class="title-comanda">
      <h2>Lista de Comandas</h2>
    </div>
    <div class="tabla-container">
      <table class="comandas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Precio Total</th>
            <th>Fecha de Creación</th>
            <th>Estado</th>
            <th>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comanda in comandas" :key="comanda.id">
            <td>{{ comanda.id }}</td>
            <td>{{ comanda.precio_total }}</td>
            <td>{{ formatDate(comanda.created_at) }}</td>
            <td>
              <select v-model="comanda.estado">
                <option value="Entregado">Entregado</option>
                <option value="Procesandose">Procesandose</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </td>
            <td>
              <ul>
                <li v-for="producto in comanda.productos" :key="producto.id">
                  Producto: {{ producto.nombre }} - Cantidad: {{ producto.cantidad }}
                </li>
              </ul>
            </td>
            <td>
              <button @click="updateComanda(comanda.id, comanda.estado)">Actualizar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import "../styles/Cocinero.css";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      comandas: [],
      errorMessage: "",
    };
  },
  mounted() {
    this.getComandas();
  },
  methods: {
    irAPerfilCocinero() {
      this.router.push("/CocineroPerfil");
    },
    cerrarSesion() {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      this.router.push("/login");
    },
    async getComandas() {
  const token = localStorage.getItem("token");
  if (!token) {
    this.errorMessage = "No se encontró el token. Por favor, inicia sesión nuevamente.";
    return;
  }

  try {
    const response = await axios.get("https://rotiserialatriada-dgjb.onrender.com/api/pedidos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Asignamos la data de la respuesta directamente a las comandas si es un array
    if (Array.isArray(response.data)) {
      this.comandas = response.data.filter(
        (comanda) => comanda.estado === "Pendiente" || comanda.estado === "Procesandose"
      );

      await this.cargarDetallesProductos();
    } else {
      this.errorMessage = "Formato inesperado de respuesta al obtener las comandas.";
    }
  } catch (error) {
    this.errorMessage = "Error al obtener las comandas: " + error.message;
    console.error("Error al obtener las comandas:", error);
  }
},
    async cargarDetallesProductos() {
      try {
        const response = await axios.get("https://rotiserialatriada-dgjb.onrender.com/api/productos");
        const productosData = response.data;

        this.comandas.forEach((comanda) => {
          comanda.productos = comanda.productos.map((producto) => {
            const detalleProducto = productosData.find((p) => p.id === producto.id);
            return detalleProducto
              ? { ...producto, nombre: detalleProducto.nombre, precio: detalleProducto.precio }
              : producto;
          });
        });
      } catch (error) {
        this.errorMessage = "Error al cargar detalles de productos: " + error.message;
        console.error("Error al cargar detalles de productos:", error);
      }
    },
    async updateComanda(comandaId, newState) {
      const token = localStorage.getItem("token");
      const payload = { estado: newState };

      try {
        await axios.patch(`https://rotiserialatriada-dgjb.onrender.com/api/pedidos/${comandaId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert(`Estado de la comanda actualizado a: ${newState}`);
        await this.getComandas();
      } catch (error) {
        this.errorMessage = "Error al actualizar la comanda: " + error.message;
        console.error(`Error al actualizar la comanda ${comandaId}:`, error);
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
</script>