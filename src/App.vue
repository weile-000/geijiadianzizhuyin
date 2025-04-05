<template>
  <div class="app-container">
    <header class="app-header">
      <h1>新建路小学汉字拼音练习生成器</h1>
    </header>
    <main class="app-content">
      <h2>米字格效果展示</h2>
      <div class="grid-examples">
        <div class="example-section">
          <h3>预览效果</h3>
          <div class="grid-preview">
            <tian-grid 
              :size="100" 
              character="你" 
              pinyin="nǐ" 
              :showPinyin="true"
              :showDiagonal="true"
            />
          </div>
        </div>
        
        <div class="example-section">
          <h3>PDF导出效果</h3>
          <div class="print-preview">
            <button @click="exportPDF" class="export-button">导出PDF</button>
            <div ref="printArea" class="print-area">
              <tian-grid 
                :size="100" 
                character="你" 
                pinyin="nǐ" 
                :showPinyin="true"
                :showDiagonal="true"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="description">
        <h3>问题修复说明</h3>
        <p>之前在预览和PDF导出中，米字格的对角线表现不一致的问题已修复。</p>
        <p>主要修复点：</p>
        <ul>
          <li>使用绝对定位和精确的旋转角度定义对角线</li>
          <li>对角线长度使用√2倍宽度，确保覆盖整个方格对角线</li>
          <li>添加特定的@media print样式，确保在PDF导出时对角线正确显示</li>
          <li>改进定位方式，确保对角线旋转中心点固定</li>
        </ul>
      </div>
      
      <!-- 添加交互式示例 -->
      <div class="interactive-example">
        <h2>交互式米字格练习</h2>
        <example-grid />
      </div>
    </main>
    <footer class="app-footer">
      <p>© 2024 新建路小学汉字拼音练习生成器</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import html2pdf from 'html2pdf.js';
import TianGrid from './components/TianGrid.vue';
import ExampleGrid from './components/ExampleGrid.vue';

// 打印区域引用
const printArea = ref<HTMLElement | null>(null);

// 导出PDF方法
const exportPDF = () => {
  if (!printArea.value) return;
  
  const element = printArea.value;
  const opt = {
    margin: 10,
    filename: '米字格示例.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // 添加打印样式
  const printStyle = document.createElement('style');
  printStyle.id = 'print-style';
  printStyle.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-area, .print-area * {
        visibility: visible;
      }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  `;
  document.head.appendChild(printStyle);
  
  // 导出PDF
  html2pdf().from(element).set(opt).save();
  
  // 移除打印样式
  setTimeout(() => {
    const style = document.getElementById('print-style');
    if (style) style.remove();
  }, 1000);
};
</script>

<style>
.app-container {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.app-header {
  background-color: #2196F3;
  color: white;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.app-content {
  background-color: #f5f5f5;
  padding: 40px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

h2 {
  color: #2196F3;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  color: #333;
  margin: 15px 0;
}

.grid-examples {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  flex-wrap: wrap;
}

.example-section {
  text-align: center;
  margin: 10px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  min-width: 200px;
}

.grid-preview, .print-area {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  min-height: 120px;
}

.export-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
}

.export-button:hover {
  background-color: #45a049;
}

.description {
  margin-top: 40px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.description ul {
  padding-left: 20px;
}

.description li {
  margin-bottom: 10px;
}

.interactive-example {
  margin-top: 50px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
}

.app-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 20px 0;
}
</style> 