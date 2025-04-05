<template>
  <div class="tian-grid" :style="gridStyle" :class="gridSizeClass">
    <div class="grid-border">
      <!-- 横线 -->
      <div class="horizontal-line top"></div>
      <div class="horizontal-line middle"></div>
      <div class="horizontal-line bottom"></div>
      
      <!-- 竖线 -->
      <div class="vertical-line left"></div>
      <div class="vertical-line middle"></div>
      <div class="vertical-line right"></div>
      
      <!-- 对角线（米字格） -->
      <div v-if="showDiagonal" class="diagonal-line top-left-to-bottom-right"></div>
      <div v-if="showDiagonal" class="diagonal-line top-right-to-bottom-left"></div>
      
      <!-- 拼音区域 -->
      <div v-if="showPinyin && pinyin" class="pinyin-container">
        <div class="pinyin-inner">
          <span class="pinyin-text" :data-tone="pinyin">{{ pinyin }}</span>
        </div>
      </div>
      
      <!-- 汉字区域 -->
      <div class="character-container">
        <span class="character-text" :class="{ 'faded': fadeCharacter }">{{ character }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: Number,
    default: 20 // 默认20mm
  },
  character: {
    type: String,
    default: ''
  },
  pinyin: {
    type: String,
    default: ''
  },
  showPinyin: {
    type: Boolean,
    default: true
  },
  showDiagonal: {
    type: Boolean,
    default: false
  },
  fadeCharacter: {
    type: Boolean,
    default: false
  }
});

// 根据尺寸计算类名
const gridSizeClass = computed(() => {
  if (props.size >= 25) return 'grid-large';
  if (props.size >= 20) return 'grid-medium';
  return 'grid-small';
});

// 计算格子样式
const gridStyle = computed(() => {
  return {
    width: `${props.size}mm`,
    height: `${props.size}mm`
  };
});
</script>

<style scoped>
.tian-grid {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
}

.grid-border {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid #000;
  box-sizing: border-box;
}

/* 横线样式 */
.horizontal-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #000;
}
.horizontal-line.top {
  top: 0;
}
.horizontal-line.middle {
  top: 50%;
}
.horizontal-line.bottom {
  bottom: 0;
}

/* 竖线样式 */
.vertical-line {
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  background-color: #000;
}
.vertical-line.left {
  left: 0;
}
.vertical-line.middle {
  left: 50%;
}
.vertical-line.right {
  right: 0;
}

/* 对角线样式 - 使用绝对定位和transform确保在预览和PDF中都能正确显示 */
.diagonal-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 141.4%; /* √2 × 100% 以确保对角线长度正确 */
  height: 1px;
  background-color: #000;
  transform-origin: 0 0;
}

.diagonal-line.top-left-to-bottom-right {
  transform: rotate(45deg);
}

.diagonal-line.top-right-to-bottom-left {
  left: 100%;
  transform-origin: 100% 0;
  transform: rotate(135deg);
}

/* 拼音容器 */
.pinyin-container {
  position: absolute;
  width: 100%;
  top: -40%;
  text-align: center;
  font-size: 12px;
  z-index: 2;
}

.pinyin-inner {
  display: inline-block;
  position: relative;
}

.pinyin-text {
  display: inline-block;
  position: relative;
  top: 38%;
}

/* 汉字容器 */
.character-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  z-index: 1;
}

.character-text {
  position: relative;
  max-width: 80%;
  max-height: 80%;
  text-align: center;
}

.character-text.faded {
  opacity: 0.3;
}

/* 根据格子大小调整字体大小 */
.grid-large .character-text {
  font-size: 24px;
}

.grid-medium .character-text {
  font-size: 18px;
}

.grid-small .character-text {
  font-size: 14px;
}

/* 确保对角线在PDF导出时也能正确显示的关键修复 */
@media print {
  .diagonal-line {
    width: 141.4% !important;
    height: 1px !important;
    transform-origin: 0 0 !important;
  }
  
  .diagonal-line.top-left-to-bottom-right {
    transform: rotate(45deg) !important;
  }
  
  .diagonal-line.top-right-to-bottom-left {
    left: 100% !important;
    transform-origin: 100% 0 !important;
    transform: rotate(135deg) !important;
  }
}
</style> 