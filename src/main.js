import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Importa el router

const app = createApp(App);
app.use(router); // Asocia el router a la aplicación
app.mount('#app');
