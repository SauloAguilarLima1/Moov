import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base = nome do repositório no GitHub Pages (https://<user>.github.io/Moov/).
// https://vite.dev/config/
export default defineConfig({
  base: '/Moov/',
  plugins: [react()],
})
