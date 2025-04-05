<template>
  <div class="grid-container">
    <div v-for="(row, rowIndex) in gridRows" :key="rowIndex" class="grid-row">
      <template v-for="(item, colIndex) in row" :key="`${rowIndex}-${colIndex}`">
        <tian-grid 
          :size="gridSize" 
          :character="item.character" 
          :pinyin="item.pinyin" 
          :showPinyin="showPinyin"
          :showDiagonal="showDiagonal"
          :fadeCharacter="fadeCharacter"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TianGrid from './TianGrid.vue';

// 定义网格项接口
interface GridItem {
  character: string;
  pinyin: string;
}

// 定义props
const props = defineProps({
  // 网格尺寸（单位mm）
  gridSize: {
    type: Number,
    default: 20
  },
  // 内容数据
  content: {
    type: Array as () => GridItem[],
    default: () => []
  },
  // 每行的字数
  charsPerRow: {
    type: Number,
    default: 8
  },
  // 是否显示拼音
  showPinyin: {
    type: Boolean,
    default: true
  },
  // 是否显示对角线（米字格）
  showDiagonal: {
    type: Boolean,
    default: false
  },
  // 是否淡化字符（用于描红模式）
  fadeCharacter: {
    type: Boolean,
    default: false
  }
});

// 计算分割成行的数据
const gridRows = computed(() => {
  const rows: GridItem[][] = [];
  let currentRow: GridItem[] = [];
  
  // 遍历内容，按照每行字数分组
  props.content.forEach((item, index) => {
    currentRow.push(item);
    
    // 如果到达每行的末尾或者是最后一项，将当前行添加到rows中
    if ((index + 1) % props.charsPerRow === 0 || index === props.content.length - 1) {
      rows.push([...currentRow]);
      currentRow = [];
    }
  });
  
  return rows;
});
</script>

<style scoped>
.grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.grid-row {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 1mm;
}
</style> 