import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      vueJsx(),
      // Solo cargar vueDevTools en modo desarrollo
      mode === 'development' && vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // Opcional: agregar más configuraciones dependiendo de tu entorno
    server: {
      // Configuración del servidor de desarrollo si es necesario
      port: 3000,  // Cambia el puerto si es necesario
      open: true,  // Abrir automáticamente el navegador
    },
  };
});
