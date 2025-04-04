<template>
  <div class="pages-container">
    <div 
      v-for="(page, pageIndex) in pages" 
      :key="pageIndex"
      class="grid-container a4-page"
    >
      <div class="grid-content">
        <div 
          v-for="row in page.rows" 
          :key="`${pageIndex}-${row.id}`" 
          class="grid-row"
          :style="{
            marginBottom: `${rowSpacing}mm`,
            ...rowWidthStyle
          }"
        >
          <TianGrid 
            v-for="(item, index) in row.items" 
            :key="`${row.id}-${index}`"
            :character="item.char"
            :size="gridSize"
            :grid-margin="gridMargin"
            :border-width="borderWidth"
            :line-width="lineWidth"
            :show-diagonals="showDiagonals"
            :show-pinyin="showPinyin"
            :show-character="showCharacter"
            :mode="mode"
            :pinyin-font-size="pinyinFontSize"
            :character-font-size="characterFontSize"
            :extra-margin="item.extraMargin"
            :comma-after="item.commaAfter"
            :pinyin-font-family="pinyinFontFamily"
            :character-font-family="characterFontFamily"
          />
        </div>
      </div>
      <!-- 页码指示器 -->
      <div class="page-indicator" v-if="pages.length > 1" data-html2canvas-ignore="true">
        {{ pageIndex + 1 }} / {{ pages.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, ref } from 'vue';
import TianGrid from './TianGrid.vue';
import { useConfigStore } from '../stores/configStore';

const config = useConfigStore();

// 从store中获取配置
const gridSize = computed(() => config.gridSize);
const gridMargin = computed(() => config.gridMargin);
const borderWidth = computed(() => config.borderWidth);
const lineWidth = computed(() => config.lineWidth);
const showDiagonals = computed(() => config.showDiagonals);
const showPinyin = computed(() => config.showPinyin);
const showCharacter = computed(() => config.showCharacter);
const mode = computed(() => config.mode);
const pageMargin = computed(() => config.pageMargin);
const pinyinFontSize = computed(() => config.pinyinFontSize);
const characterFontSize = computed(() => config.characterFontSize);
const rowSpacing = computed(() => config.rowSpacing);
const pinyinFontFamily = computed(() => config.pinyinFontFamily);
const characterFontFamily = computed(() => config.characterFontFamily);

// 检查字符是否为标点符号
const isPunctuation = (char: string): boolean => {
  // 检查是否为英文标点符号
  if (/[,.;:'"!?()[\]{}<>\/\\|`~@#$%^&*+=_-]/.test(char)) {
    return true;
  }

  // 检查是否为中文标点符号 (Unicode范围)
  // 中文标点符号范围: \u3000-\u303F, \uFF00-\uFFEF
  if (/[\u3000-\u303F\uFF00-\uFFEF]/.test(char)) {
    return true;
  }

  return false;
};

// 检查是否为逗号
const isComma = (char: string): boolean => {
  return char === ',' || char === '，' || char === '\uFF0C';
};

// 预处理字符串，处理连续空格和逗号
const preprocessText = (text: string): string[] => {
  const result: string[] = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // 忽略空格
    if (char === ' ' || char === '\u00A0' || char === '\u3000') {
      continue;
    }
    result.push(char);
  }
  
  return result;
};

// 计算每行列数
const colsPerRow = computed(() => {
  return config.gridLayout.cols; // 使用configStore中的gridLayout.cols
});

// 计算每页可以容纳的行数
const rowsPerPage = computed(() => config.gridLayout.rows);

// 计算每行的实际宽度
const rowWidthStyle = computed(() => {
  // 内容区域应为整个A4宽度减去左右页边距
  const effectiveWidth = 210 - (pageMargin.value * 2);
  
  // 为了让所有页面保持一致的内容宽度，设置固定宽度
  return {
    width: `${effectiveWidth}mm`,
    justifyContent: 'center', // 内容居中对齐
    display: 'flex',
    alignItems: 'center'
  };
});

// 将字符数组分成多行
const allRows = computed(() => {
  const chars = preprocessText(config.content);
  const rows: Array<{
    id: number, 
    items: Array<{ 
      char: string, 
      width: number, 
      extraMargin?: boolean, 
      commaAfter?: boolean 
    }>
  }> = [];
  let currentRow = { 
    id: 0, 
    items: [] as Array<{ 
      char: string, 
      width: number, 
      extraMargin?: boolean, 
      commaAfter?: boolean 
    }>
  };
  let currentColCount = 0;
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const hasNextChar = i < chars.length - 1;
    const nextChar = hasNextChar ? chars[i + 1] : '';
    const isNextComma = hasNextChar && isComma(nextChar);
    
    // 如果当前行已满，创建新行
    if (currentColCount >= colsPerRow.value) {
      rows.push(currentRow);
      currentRow = { 
        id: rows.length, 
        items: [] as Array<{ 
          char: string, 
          width: number, 
          extraMargin?: boolean, 
          commaAfter?: boolean 
        }>
      };
      currentColCount = 0;
    }
    
    // 当前字符是逗号的情况
    if (isComma(char)) {
      // 如果有前一个字符，将逗号添加到前一个字符的格子中
      if (currentRow.items.length > 0) {
        const lastItem = currentRow.items[currentRow.items.length - 1];
        lastItem.commaAfter = true;
      } else {
        // 如果没有前一个字符（行首），作为普通字符添加
        currentRow.items.push({ 
          char, 
          width: 1, 
          extraMargin: false 
        });
        currentColCount += 1;
      }
    } else {
      // 正常字符
      currentRow.items.push({ 
        char, 
        width: 1, 
        extraMargin: false,
        commaAfter: isNextComma
      });
      currentColCount += 1;
      
      // 如果下一个是逗号，跳过它
      if (isNextComma) {
        i++;
      }
    }
  }
  
  // 添加最后一行
  if (currentRow.items.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
});

// 将所有行分成多页
const pages = computed(() => {
  const rows = allRows.value;
  const pages = [];
  let currentPage = { rows: [] as typeof rows };
  let currentRowCount = 0;
  
  rows.forEach((row) => {
    // 如果当前页已满，创建新页
    if (currentRowCount >= rowsPerPage.value) {
      pages.push(currentPage);
      currentPage = { rows: [] };
      currentRowCount = 0;
    }
    
    currentPage.rows.push(row);
    currentRowCount++;
  });
  
  // 添加最后一页
  if (currentPage.rows.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
});
</script>

<style scoped>
.pages-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  align-items: center;
}

.a4-page {
  width: 210mm; /* 标准A4宽度 */
  height: 297mm; /* 标准A4高度 */
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  /* 确保尺寸固定，不受内容影响 */
  max-width: 210mm;
  max-height: 297mm;
  min-width: 210mm;
  min-height: 297mm;
}

.grid-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 添加垂直居中 */
  padding: 0; /* 移除额外的顶部内边距 */
  flex-grow: 1; /* 允许内容占满可用空间 */
}

.grid-container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  width: 100%;
  height: 100%; /* 使用100%高度 */
  padding: calc(v-bind(pageMargin) * 1mm); /* 使用动态计算的页边距 */
  box-sizing: border-box;
}

.grid-row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center; /* 改为内容居中 */
  width: 100%;
  box-sizing: border-box;
  min-height: calc(v-bind(gridSize) * 1mm); /* 确保最小高度为田字格的高度 */
}

.page-indicator {
  position: absolute;
  bottom: 5mm;
  right: 5mm;
  font-size: 12px;
  color: #999;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2px 6px;
  border-radius: 3px;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  
  .pages-container {
    gap: 0 !important;
    display: block !important; /* 使用块级显示替代flex */
    overflow: visible !important;
  }
  
  .a4-page {
    box-shadow: none !important;
    margin: 0 auto !important; /* 确保水平居中 */
    padding: calc(v-bind(pageMargin) * 1mm) !important; /* 显式使用页边距，而不是inherit */
    height: auto !important;      /* 允许内容决定高度 */
    min-height: 297mm !important; /* 最小高度保持A4大小 */
    width: 210mm !important;
    page-break-after: always !important;
    page-break-before: auto !important;
    page-break-inside: avoid !important;
    overflow: visible !important;
    float: none !important;
    position: relative !important;
    box-sizing: border-box !important; /* 确保padding计入宽高 */
    display: flex !important; /* 使用flex布局 */
    flex-direction: column !important;
    justify-content: center !important; /* 垂直居中 */
    align-items: center !important; /* 水平居中 */
  }
  
  .a4-page:last-child {
    page-break-after: auto !important;
  }
  
  .grid-container {
    /* 删除padding: inherit !important; */
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .grid-content {
    page-break-inside: avoid !important;
    overflow: visible !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }
  
  .grid-row {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    justify-content: center !important; /* 确保每行内容居中 */
  }
  
  .page-indicator {
    display: none !important;
  }
}
</style> 