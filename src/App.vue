<template>
  <div id="app">
    <router-view></router-view>
    <footer class="footer">
    ©2024 Rotiseria La Triada. Todos los derechos reservados.</footer>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
body {
  font-family:Arial, Helvetica, sans-serif;
  background-image: url('../src/images/logorotiseria.png') repeat;
}
.footer {
  background-color: #616161; /* Color de fondo */
  color: #fff;            /* Color del texto */
  padding: 10px 20px;
  text-align: center;
}
</style>
