import { defineStore } from 'pinia'

// 定义默认配置，便于重置使用
const defaultSettings = {
  // 田字格设置
  gridSize: 15, // 默认15mm (图片中的设置)
  borderWidth: 1, // 边框粗细
  lineWidth: 0.5, // 中心线粗细
  showDiagonals: false, // 是否显示对角线（米字格）
  gridMargin: 0.5, // 格子间距 (调整回0.5mm)
  rowSpacing: 2, // 行间距 (从2.5减小到2)
  
  // 拼音和汉字显示配置
  showPinyin: true, // 是否显示拼音(四线三格)
  showCharacter: true, // 是否显示汉字
  mode: 'normal', // 模式: normal(正常), write(看拼音写汉字), read(汉字注音), trace(描红)
  
  // 页面配置
  pageMargin: 10, // 统一的页边距 (mm) - 从15减小到10
  pinyinFontSize: 0.4, // 拼音字体大小，修改为40%
  characterFontSize: 0.67, // 汉字字体大小（图片中显示67%）
  
  // 字体配置
  pinyinFontFamily: 'Arial, Microsoft YaHei, sans-serif', // 拼音字体
  characterFontFamily: 'KaiTi, SimKai, Microsoft YaHei, sans-serif', // 汉字字体
  
  // 导出配置
  filename: '汉字练习.pdf',
  
  // 内容
  content: '你好世界，这是汉字拼音练习工具。拼音音节练习：zhuyin gongju。', // 默认内容
};

export const useConfigStore = defineStore('config', {
  state: () => ({
    content: '',
    gridSize: 18,       // 田字格大小 (mm)
    borderWidth: 1,     // 边框宽度 (px)
    lineWidth: 0.5,     // 线条宽度 (px)
    gridMargin: 0.5,    // 格子间距 (mm)
    pageMargin: 10,     // 页面边距 (mm)
    rowSpacing: 2,      // 行间距 (mm)
    showDiagonals: false, // 是否显示米字格
    showPinyin: true,   // 是否显示拼音
    showCharacter: true, // 是否显示汉字
    mode: 'normal',     // 练习模式: normal, read, write, trace
    characterFontSize: 0.6, // 汉字字体大小 (相对于格子的比例)
    pinyinFontSize: 0.4,  // 拼音字体大小，增大默认值为40%
    pinyinFontFamily: 'Arial, Microsoft YaHei, sans-serif', // 拼音字体
    characterFontFamily: 'KaiTi, SimKai, Microsoft YaHei, sans-serif', // 汉字字体
    customFonts: [] as Array<{name: string, url: string, type: 'pinyin' | 'character', displayName?: string}>, // 自定义字体
    filename: '汉字练习.pdf', // 添加filename到state
  }),
  
  getters: {
    // 获取分解后的字符数组
    characters: (state) => state.content.split(''),
    
    // 计算每页可容纳的田字格数量
    gridLayout: (state) => {
      // A4尺寸 (210mm × 297mm)
      const pageWidth = 210;
      const pageHeight = 297;
      
      // 考虑页边距和安全边距（移除额外的安全边距）
      const totalMargin = state.pageMargin;
      
      // 计算有效内容区域
      const contentWidth = pageWidth - (totalMargin * 2);
      const contentHeight = pageHeight - (totalMargin * 2);
      
      // 计算每行每列可容纳的格子数
      // 考虑到拼音格的高度，调整垂直方向的计算
      let rowHeight;
      
      if (state.showPinyin) {
        // 有拼音时的行高 = 田字格高度 + 拼音格高度 + 间隔 + 行间距
        const pinyinHeight = state.gridSize * 0.7; // 拼音格高度
        const spacing = 0.5; // 拼音格和田字格之间的间隔
        rowHeight = state.gridSize + pinyinHeight + spacing + state.rowSpacing;
      } else {
        // 无拼音时的行高 = 田字格高度 + 行间距
        rowHeight = state.gridSize + state.rowSpacing;
      }
      
      // 每个格子的实际宽度 = 格子宽度 + 两侧间距
      const effectiveGridWidth = state.gridSize + state.gridMargin * 2;

      // 每行可容纳的格子数（向下取整确保不会溢出）
      const gridsPerRow = Math.floor(contentWidth / effectiveGridWidth);
      
      // 每页可容纳的行数（向下取整确保不会溢出）
      const gridsPerColumn = Math.floor(contentHeight / rowHeight);
      
      return {
        cols: gridsPerRow,
        rows: gridsPerColumn,
        total: gridsPerRow * gridsPerColumn,
        width: contentWidth,
        height: contentHeight,
        rowHeight: rowHeight
      };
    }
  },
  
  actions: {
    setGridSize(size: number) {
      this.gridSize = size;
      // 根据格子大小自动调整其他相关参数
      this.borderWidth = size >= 20 ? 1 : 0.5;
      this.lineWidth = size >= 20 ? 0.5 : 0.3;
    },
    
    setMode(newMode: string) {
      this.mode = newMode;
      // 根据模式自动设置显示选项
      switch (newMode) {
        case 'write': // 看拼音写汉字
          this.showPinyin = true;
          this.showCharacter = false;
          break;
        case 'read': // 汉字注音
          this.showPinyin = true;
          this.showCharacter = true;
          break;
        case 'trace': // 描红练习
          this.showPinyin = false;
          this.showCharacter = true;
          break;
        default: // 正常模式
          this.showPinyin = true;
          this.showCharacter = true;
          break;
      }
    },
    
    // 恢复默认设置
    resetToDefaults() {
      // 恢复所有默认设置
      const keys = Object.keys(defaultSettings) as (keyof typeof defaultSettings)[];
      keys.forEach(key => {
        // @ts-ignore - 类型兼容性处理
        this[key] = defaultSettings[key];
      });
    }
  }
}) 