import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 개발 중 /api 요청을 EC2 백엔드로 프록시
      '/api': {
        target: 'http://ec2-43-200-224-84.ap-northeast-2.compute.amazonaws.com:3000',
        changeOrigin: true,
      }
    }
  }
})