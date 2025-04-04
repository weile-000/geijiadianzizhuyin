<template>
  <div class="grid-unit" :style="extraMargin ? {marginRight: `${gridMargin * 2}mm`} : {}">
    <!-- 四线三格拼音格 -->
    <template v-if="showPinyin">
      <div 
        v-if="pinyinText" 
        class="pinyin-grid"
        :style="{ 
          width: `${size}mm`,
          height: `${size * 0.7}mm`, /* 从0.5调整为0.7，增大拼音格高度 */
          margin: `0 ${gridMargin}mm`
        }"
      >
        <!-- 四条横线形成三个区域 -->
        <div class="pinyin-line top-line"></div>
        <div class="pinyin-line middle-line"></div>
        <div class="pinyin-line baseline"></div>
        <div class="pinyin-line bottom-line"></div>
        
        <!-- 拼音文本 -->
        <div class="pinyin-text" :style="{ 
          fontSize: `${pinyinFontSize * size}mm`
        }">
          <!-- 使用更直接的字体应用方式，添加引号 -->
          <span 
            class="pinyin-inner"
            :style="{
              fontFamily: pinyinFontFamily ? (pinyinFontFamily.includes(',') ? 
                pinyinFontFamily : `'${pinyinFontFamily}'`) : 'Arial, sans-serif'
            }"
          >{{ pinyinText }}</span>
        </div>
      </div>
      
      <!-- 空拼音格 (保持占位) -->
      <div 
        v-else
        class="pinyin-grid empty"
        :style="{ 
          width: `${size}mm`,
          height: `${size * 0.7}mm`, /* 从0.5调整为0.7，增大拼音格高度 */
          margin: `0 ${gridMargin}mm`
        }"
      >
        <!-- 四条横线形成三个区域 -->
        <div class="pinyin-line top-line"></div>
        <div class="pinyin-line middle-line"></div>
        <div class="pinyin-line baseline"></div>
        <div class="pinyin-line bottom-line"></div>
      </div>
      
      <!-- 田字格之间的间距 -->
      <div style="height: 0.5mm;"></div>
    </template>
    
    <!-- 田字格 -->
    <div 
      class="tian-grid"
      :style="{
        width: `${size}mm`,
        height: `${size}mm`,
        borderWidth: `${borderWidth}px`,
        margin: `0 ${gridMargin}mm`
      }"
    >
      <!-- 中心十字线 -->
      <div class="cross-lines">
        <div class="horizontal" :style="{ height: `${lineWidth}px` }"></div>
        <div class="vertical" :style="{ width: `${lineWidth}px` }"></div>
      </div>
      
      <!-- 对角线 (米字格) -->
      <div v-if="showDiagonals" class="diagonal-lines">
        <div class="diagonal1"></div>
        <div class="diagonal2"></div>
      </div>
      
      <!-- 汉字容器 -->
      <div class="character-container" v-if="character">
        <!-- 汉字区域 -->
        <div 
          class="character" 
          :class="{ 'trace-mode': mode === 'trace' }"
          :style="{ 
            fontSize: `${characterFontSize * size}mm`,
            opacity: mode === 'trace' ? 0.3 : 1
          }"
          v-if="showCharacter || mode === 'trace'"
        >
          <!-- 使用更直接的字体应用方式，确保字体名称有引号 -->
          <span 
            class="char-text"
            :style="{ 
              fontFamily: characterFontFamily ? (characterFontFamily.includes(',') ? 
                characterFontFamily : `'${characterFontFamily}'`) : 'KaiTi, SimKai, serif'
            }"
          >{{ character }}</span>
        </div>
        
        <!-- 逗号作为独立元素 -->
        <span 
          v-if="commaAfter" 
          class="comma-suffix"
          :style="{ fontSize: `${characterFontSize * size * 0.7}mm` }"
        >,</span>
        
        <!-- 用户输入区域 (仅在写字模式下显示) -->
        <div v-if="mode === 'write'" class="input-area"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pinyin } from 'pinyin-pro';

interface Props {
  character?: string;
  size: number;
  gridMargin: number;
  borderWidth: number;
  lineWidth: number;
  showDiagonals: boolean;
  showPinyin: boolean;
  showCharacter: boolean;
  mode: string;
  pinyinFontSize: number;
  characterFontSize: number;
  extraMargin?: boolean;
  commaAfter?: boolean;
  pinyinFontFamily?: string;
  characterFontFamily?: string;
}

const props = withDefaults(defineProps<Props>(), {
  character: '',
  size: 20,
  gridMargin: 0.5,
  borderWidth: 1,
  lineWidth: 0.5,
  showDiagonals: false,
  showPinyin: true,
  showCharacter: true,
  mode: 'normal',
  pinyinFontSize: 0.3,
  characterFontSize: 0.6,
  extraMargin: false,
  commaAfter: false,
  pinyinFontFamily: 'Arial, Microsoft YaHei, sans-serif',
  characterFontFamily: 'KaiTi, SimKai, Microsoft YaHei, sans-serif'
});

// 计算拼音文本
const pinyinText = computed(() => {
  // 如果是汉字注音模式，不显示拼音文本
  if (props.mode === 'read') return '';
  
  if (!props.character || props.character.trim() === '') return '';
  
  // 使用声调符号模式获取完整拼音（包括声母和韵母）
  return pinyin(props.character, { 
    toneType: 'symbol',  // 使用声调符号
    nonZh: 'removed',    // 移除非汉字内容
    v: true              // 使用v表示ü
  });
});
</script>

<style scoped>
/* 整体容器样式 */
.grid-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 四线三格拼音格样式 */
.pinyin-grid {
  position: relative;
  box-sizing: border-box;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #4CAF50; /* 绿色边框 */
}

.pinyin-grid.empty {
  border: 1px solid #4CAF50; /* 空拼音格也使用绿色实线边框 */
  background-color: white;
}

.pinyin-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #4CAF50; /* 所有线条都使用绿色 */
}

.top-line {
  top: 0;
  background-color: #4CAF50; /* 绿色顶线 */
}

.middle-line {
  top: 33.3%; /* 精确设置为三等分位置 */
  background-color: #4CAF50; /* 绿色中线 */
}

.baseline {
  top: 66.6%; /* 精确设置为三等分位置 */
  background-color: #4CAF50; /* 绿色基线 */
}

.bottom-line {
  bottom: 0;
  background-color: #4CAF50; /* 绿色底线 */
}

.pinyin-text {
  color: #333;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  position: absolute;
  z-index: 2;
  line-height: 1;
  /* 以下部分调整拼音位置，使其在中线和基线之间偏上位置 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  top: 38%; /* 调整到更合适的位置 */
  height: 33.3%;
  padding: 0;
  margin: 0;
  /* 字体渲染优化 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 拼音内部文本 */
.pinyin-inner {
  /* 拼音字体特性 */
  font-feature-settings: "kern", "liga", "clig", "calt";
  font-synthesis: none;
  /* 提高字体渲染质量 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 田字格样式 */
.tian-grid {
  box-sizing: border-box;
  border: solid #333;
  position: relative;
  background-color: white;
}

.cross-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.horizontal {
  position: absolute;
  width: 100%;
  background-color: #aaa;
}

.vertical {
  position: absolute;
  height: 100%;
  background-color: #aaa;
}

.diagonal-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.diagonal1, .diagonal2 {
  position: absolute;
  width: 100%;
  height: 100%;
}

.diagonal1 {
  background: linear-gradient(to top right, transparent calc(50% - 0.5px), #aaa, transparent calc(50% + 0.5px));
}

.diagonal2 {
  background: linear-gradient(to top left, transparent calc(50% - 0.5px), #aaa, transparent calc(50% + 0.5px));
}

.character-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.character {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  position: relative;
  width: 100%;
  height: 100%;
  /* 字体渲染优化 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.trace-mode {
  color: #999;
}

.input-area {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* 修改逗号样式，确保它在田字格的右下角合适位置 */
.comma-suffix {
  position: absolute;
  right: 1%;
  bottom: 1%;
  line-height: 1;
  color: #333;
  font-family: 'KaiTi', 'SimKai', 'Microsoft YaHei', sans-serif;
  font-weight: normal;
}

/* 汉字样式 */
.char-text {
  /* 字体特性优化 */
  font-feature-settings: "locl";
  letter-spacing: 0;
  font-variant-east-asian: traditional;
  font-synthesis: none;
  /* 提高字体渲染质量 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: normal;
  /* 确保字体继承正确 */
  display: inline-block;
  /* 确保字体正确应用 */
  font-style: normal;
}

@media print {
  .tian-grid {
    break-inside: avoid;
    margin: 0.2mm !important; /* 从0.5mm减小到0.2mm */
  }
  
  .pinyin-grid {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    margin: 0.2mm !important; /* 添加边距控制 */
  }
}
</style> 