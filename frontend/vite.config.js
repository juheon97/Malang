// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';

// export default defineConfig({
//   plugins: [react()],
//   preview: {
//     port: 5176,
//     host: true,
//     allowedHosts: ['j12d110.p.ssafy.io'],
//   },
//   server: {
//     allowedHosts: [
//       //위, 아래 db 서버 다름 따라서 데이터 다를 수 있음
//       '54db-14-46-141-158.ngrok-free.app', // 이건 ngrok 서버임
//       'backend.takustory.site', // 팀장 노트북 서버 켜져야 작동됨
//     ],
//   },
// });

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';

// export default defineConfig({
//   plugins: [react()],
//   preview: {
//     port: 5176,
//     host: true,
//     allowedHosts: ['j12d110.p.ssafy.io'],
//   },
//   server: {
//     allowedHosts: [
//       'j12d110.p.ssafy.io', // 팀장 노트북 서버 켜져야 작동됨
//       '3c49-59-151-219-8.ngrok-free.app',
//     ],
//   },
// });

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
    },
    allowedHosts: ['j12d110.p.ssafy.io', '3c49-59-151-219-8.ngrok-free.app'],
  },
});
