import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue'; // Importa el componente de Login
import Register from '../components/Register.vue'; // Importa el componente de Register
import CocineroHome from '../components/Cocinerohome.vue';
import Adminhome from '../components/Adminhome.vue';
import Stock from '../components/Stock.vue';
import Cocineroperfil from '@/components/Cocineroperfil.vue';
import Listausuarios from '@/components/Listausuarios.vue';
const routes = [
  { path: '/', redirect: '/login' }, // Redirecciona la ruta base al login
  { path: '/login', name: 'Login', component: Login }, // Ruta para la pantalla de Login
  { path: '/register', name: 'Register', component: Register }, // Ruta para la pantalla de Registro
  { path: '/Adminhome', component: Adminhome },//Ruta para la pantalla de administrador
  { path: '/cocinerohome',name: 'Cocinerohome', component: CocineroHome },//Ruta para la pantalla de cocinero
  { path: '/stock', name: 'Stock', component: Stock },
  { path: '/cocineroperfil', name: 'Cocineroperfil', component: Cocineroperfil },
  { path: '/listausuarios', name: 'ListaUsuarios', component: Listausuarios },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

