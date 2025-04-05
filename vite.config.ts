import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // 设置为相对路径，以便于GitHub Pages部署
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置@别名指向src目录
    },
  },
  build: {
    outDir: 'dist', // 构建输出目录
    assetsDir: 'assets', // 静态资源目录
    minify: 'terser', // 使用terser进行混淆
    terserOptions: {
      compress: {
        drop_console: false, // 保留控制台日志，方便调试
        drop_debugger: true, // 删除debugger语句
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 将Vue相关库拆分成单独的chunk
          vue: ['vue'],
          // 将html2pdf拆分成单独的chunk
          'html2pdf': ['html2pdf.js'],
        },
      },
    },
  },
  server: {
    host: true, // 监听所有地址
    port: 3000, // 开发服务器端口
    open: true, // 自动打开浏览器
  },
}) 