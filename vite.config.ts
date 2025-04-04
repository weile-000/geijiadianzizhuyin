import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/geijiadianzizhuyin/',
  build: {
    outDir: 'dist',
    // 生成源码映射文件，这对调试很有帮助
    sourcemap: true,
    // 压缩代码
    minify: 'terser',
    // 确保静态资源被正确处理
    assetsInlineLimit: 4096,
  }
})
