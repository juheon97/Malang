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
    allowedHosts: [
      'e27c-14-46-141-158.ngrok-free.app', // 이건 ngrok 서버, 안되면 이거 주석처리하고 EC2 연결 바람
      'backend.takustory.site/api', //백엔드 팀장 컴퓨터 서버 켜져있어야 작동, 안되면 주석처리
    ],
  },
});
