import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 5176,
    host: true,
    allowedHosts: ['j12d110.p.ssafy.io', 'all'],
  },
  server: {
    allowedHosts: ['79bd-14-46-141-158.ngrok-free.app'],
  },
});
