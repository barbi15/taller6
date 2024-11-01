<template>
  <div id="app">
    <router-view></router-view>
    <footer class="footer">
      <p>&copy; 2024 Rotisería La Triada. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background-color: #ffffff;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Ocupa toda la altura de la ventana */
}

footer.footer {
  text-align: center;
  padding: 10px;
  background-color: #c4ced8;
  color: #abb2b8;
  font-size: 0.9em;
  margin-top: auto; /* Mueve el footer al final del contenedor flex */
}

</style>
