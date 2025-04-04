import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 样式引用顺序很重要：先引入基础样式，再引入自定义样式
import 'element-plus/dist/index.css'
import './style.css'
import './assets/font-styles.css'

import App from './App.vue'

// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 确保字体加载成功的辅助函数
const setupFontLoadingIndicator = () => {
  // 创建一个标记，表示字体正在加载
  document.documentElement.classList.add('fonts-loading');
  
  // 使用FontFace API检测字体加载状态
  if (typeof document.fonts !== 'undefined' && document.fonts.ready) {
    document.fonts.ready.then(() => {
      console.log('所有字体已加载完成');
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    }).catch(err => {
      console.warn('字体加载失败:', err);
      // 即使加载失败，也标记为已完成
      document.documentElement.classList.remove('fonts-loading');
    });
  } else {
    // 如果不支持FontFace API，1秒后直接标记为已完成
    setTimeout(() => {
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    }, 1000);
  }
}

// 应用配置
app.use(ElementPlus)
app.use(pinia)

// 挂载应用
app.mount('#app')

// 设置字体加载指示器
setupFontLoadingIndicator();
