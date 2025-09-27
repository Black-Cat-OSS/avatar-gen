import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'
import { defineConfig } from 'vite'
import { welcomeMessage } from './plugins'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    qrcode({
      filter: (url) => {
        return url.startsWith('http://192.168')
      },
    }),
    welcomeMessage({
      message: '🚀 Добро пожаловать в React SDK!',
      color: 'green',
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 12965,
    host: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName:
        '[name]__[local]___[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @use "sass:color";
        `,
      },
    },
  },
})
