<template>
  <div class="text-display" 
    ref="gridRef"
    :class="{ 
      'vertical': displayConfig.verticalLayout,
      ['font-' + displayConfig.fontSize]: true,
      ['align-' + displayConfig.textAlign]: true,
      ['line-spacing-' + displayConfig.lineSpacing]: true,
      ['character-spacing-' + displayConfig.characterSpacing]: true
    }">
    <div v-for="(group, groupIndex) in textGroups" :key="groupIndex" class="text-group">
      <div v-for="(item, index) in group" :key="index">
        <span v-if="item.type === 'character'" 
              class="character apply-character-font character-font-optimized">
          {{ item.content }}
        </span>
        <span v-else-if="item.type === 'pinyin'" 
              class="pinyin apply-pinyin-font pinyin-font-optimized"
              :data-content="item.content">
          {{ item.content }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, toRef, watch, onMounted } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useConfigStore } from '../stores/configStore';

// 定义文本项类型
interface TextItem {
  type: 'character' | 'pinyin';
  content: string;
}

// 定义显示配置类型
interface DisplayConfig {
  verticalLayout: boolean;
  fontSize: string;
  textAlign: string;
  lineSpacing: string;
  characterSpacing: string;
}

// 定义Props类型
const props = defineProps<{
  textGroups: TextItem[][];
  displayConfig: DisplayConfig;
}>();

// 获取设置
const settingsStore = useSettingsStore();
const configStore = useConfigStore();

// DOM引用
const gridRef = ref<HTMLElement | null>(null);

// 同步字体设置
onMounted(() => {
  console.log('TextDisplay组件已挂载，应用字体设置');
  
  // 确保立即应用当前选择的字体
  applyCustomFonts();
  
  // 监听字体变化
  watch([characterFontFamily, pinyinFontFamily], () => {
    console.log('字体设置变化，重新应用字体');
    applyCustomFonts();
  });
  
  // 监听字体加载状态
  document.addEventListener('fontLoaded', (e: Event) => {
    // @ts-ignore 自定义事件的类型处理
    const fontInfo = (e as CustomEvent).detail;
    if (fontInfo) {
      console.log(`收到字体加载事件: ${fontInfo.family} (${fontInfo.type})`);
      applyCustomFonts();
    }
  });
});

// 应用自定义字体的统一方法
function applyCustomFonts() {
  console.log('开始应用字体设置到文本显示组件');
  
  // 查找所有字符和拼音元素
  const charElements = document.querySelectorAll('.character') || [];
  const pinyinElements = document.querySelectorAll('.pinyin') || [];
  
  console.log(`找到 ${charElements.length} 个汉字元素, ${pinyinElements.length} 个拼音元素`);
  
  // 应用汉字字体
  const charFontName = characterFontFamily.value;
  if (charFontName) {
    console.log(`应用汉字字体: ${charFontName}`);
    charElements.forEach((el: Element) => {
      if (el instanceof HTMLElement) {
        // 直接设置内联样式确保最高优先级
        el.style.fontFamily = `"${charFontName}", KaiTi, SimKai, serif`;
        
        // 保存原始类名并添加优化类
        const originalClasses = Array.from(el.classList).filter(cls => 
          !cls.includes('font-') && !cls.includes('_20') && !cls.includes('-font')
        );
        el.className = [...originalClasses, 'character-font-optimized', charFontName.replace(/[^a-zA-Z0-9_-]/g, '_')].join(' ');
      }
    });
  }
  
  // 应用拼音字体
  const pinyinFontName = pinyinFontFamily.value;
  if (pinyinFontName) {
    console.log(`应用拼音字体: ${pinyinFontName}`);
    pinyinElements.forEach((el: Element) => {
      if (el instanceof HTMLElement) {
        // 直接设置内联样式确保最高优先级
        el.style.fontFamily = `"${pinyinFontName}", Arial, "Microsoft YaHei", sans-serif`;
        
        // 保存原始类名并添加优化类
        const originalClasses = Array.from(el.classList).filter(cls => 
          !cls.includes('font-') && !cls.includes('_20') && !cls.includes('-font')
        );
        el.className = [...originalClasses, 'pinyin-font-optimized', pinyinFontName.replace(/[^a-zA-Z0-9_-]/g, '_')].join(' ');
      }
    });
  }
  
  console.log('字体应用完成');
}

// 确保引用的字体名称是安全的
const characterFontFamily = computed(() => {
  const font = settingsStore.characterFontFamily || 'SimSun';
  return font;
});

const pinyinFontFamily = computed(() => {
  const font = settingsStore.pinyinFontFamily || 'Arial';
  return font;
});
</script>

<style scoped>
.text-display {
  padding: 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #333;
  line-height: 1.6;
}

.text-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.character {
  font-weight: normal;
  text-align: center;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.pinyin {
  font-weight: normal;
  text-align: center;
  user-select: none;
  font-size: 14px;
  color: #666;
  position: absolute;
  top: -35px !important; /* 调整拼音高度位置 */
  left: 0;
  right: 0;
  margin: 0 auto;
  height: auto;
  transform: none; /* 移除transform，使用固定位置 */
  z-index: 2;
  padding-bottom: 0;
  line-height: 1;
}

/* 字体优化类 */
.character-font-optimized {
  font-synthesis: none !important; /* 禁止浏览器合成斜体或粗体 */
  text-transform: none !important;
  letter-spacing: normal;
  font-stretch: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.pinyin-font-optimized {
  font-synthesis: style; /* 允许合成斜体 */
  text-transform: none !important; 
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 汉字排版方向样式 */
.vertical .character {
  writing-mode: vertical-rl;
  margin-bottom: 8px;
}

/* 不同尺寸的字体大小设置 */
.font-small .character {
  font-size: 20px;
}

.font-small .pinyin {
  font-size: 12px;
}

.font-medium .character {
  font-size: 30px;
}

.font-medium .pinyin {
  font-size: 14px;
  top: -40px !important; /* 对中等字体调整拼音位置 */
}

.font-large .character {
  font-size: 40px;
}

.font-large .pinyin {
  font-size: 16px;
  top: -45px !important; /* 对大字体调整拼音位置 */
}

/* 文本对齐方式 */
.align-left {
  text-align: left;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

/* 行间距样式 */
.line-spacing-small {
  line-height: 1.3;
}

.line-spacing-medium {
  line-height: 1.6;
}

.line-spacing-large {
  line-height: 2;
}

/* 字间距样式 */
.character-spacing-small {
  letter-spacing: 0;
}

.character-spacing-medium {
  letter-spacing: 2px;
}

.character-spacing-large {
  letter-spacing: 4px;
}

/* 处理带有下延部分的字母 */
.pinyin[data-content*="z"],
.pinyin[data-content*="g"],
.pinyin[data-content*="y"],
.pinyin[data-content*="p"],
.pinyin[data-content*="q"],
.pinyin[data-content*="j"] {
  top: -38px !important; /* 对带下延字母进行微调，让它们与拼音格第三条线对齐 */
}

.font-medium .pinyin[data-content*="z"],
.font-medium .pinyin[data-content*="g"],
.font-medium .pinyin[data-content*="y"],
.font-medium .pinyin[data-content*="p"],
.font-medium .pinyin[data-content*="q"],
.font-medium .pinyin[data-content*="j"] {
  top: -43px !important; /* 针对中等字体带下延部分的拼音字母的调整 */
}

.font-large .pinyin[data-content*="z"],
.font-large .pinyin[data-content*="g"],
.font-large .pinyin[data-content*="y"],
.font-large .pinyin[data-content*="p"],
.font-large .pinyin[data-content*="q"],
.font-large .pinyin[data-content*="j"] {
  top: -48px !important; /* 针对大字体带下延部分的拼音字母的调整 */
}
</style> 