import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 5176,
    host: true,
    allowedHosts: ['j12d110.p.ssafy.io'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://j12d110.p.ssafy.io',
        changeOrigin: true,
        secure: true,
      },
    },
    allowedHosts: ['j12d110.p.ssafy.io', '3c49-59-151-219-8.ngrok-free.app'],
  },
});
