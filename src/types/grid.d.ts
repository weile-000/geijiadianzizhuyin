// 网格项目接口
export interface GridItem {
  character: string;
  pinyin: string;
}

// 网格尺寸类型
export type GridSize = 'small' | 'medium' | 'large' | number;

// 网格行数据
export type GridRow = GridItem[];

// 网格数据
export type GridData = GridRow[];

// 网格配置选项
export interface GridOptions {
  showPinyin: boolean;
  showDiagonal: boolean;
  charsPerRow: number;
  gridSize: GridSize;
} 