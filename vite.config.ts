import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],

  server: {
    port: 3000,       // Cambiamos el puerto para evitar los puertos excluidos de Windows (Hyper-V)
    host: '127.0.0.1', // Forzamos IPv4
    strictPort: false, // Permitir buscar otro puerto si este está ocupado
  }
})
