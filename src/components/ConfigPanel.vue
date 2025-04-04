<template>
  <div class="config-panel">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>配置面板</span>
          <el-button type="text" @click="resetToDefaults">恢复默认设置</el-button>
        </div>
      </template>
      
      <!-- 内容输入区域 -->
      <div class="section">
        <h3>内容设置</h3>
        <el-input
          v-model="content"
          type="textarea"
          :rows="4"
          placeholder="请输入要练习的汉字内容"
        />
        
        <!-- 添加上传.txt文件功能 -->
        <div class="upload-file-container">
          <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept=".txt"
            :on-change="handleFileUpload"
          >
            <el-button type="primary" plain size="small">
              <el-icon class="el-icon--left"><Upload /></el-icon>
              上传文本文件
            </el-button>
          </el-upload>
          <span class="upload-tip">支持上传.txt文件</span>
        </div>
      </div>
      
      <!-- 练习模式选择 -->
      <div class="section">
        <h3>练习模式</h3>
        <el-radio-group v-model="mode" @change="handleModeChange">
          <el-radio label="normal">正常模式</el-radio>
          <el-radio label="write">看拼音写汉字</el-radio>
          <el-radio label="read">汉字注音</el-radio>
          <el-radio label="trace">描红练习</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 田字格设置 -->
      <div class="section">
        <h3>田字格设置</h3>
        
        <div class="sub-section">
          <div class="slider-container">
            <span class="slider-label">大小: {{ gridSize }}mm</span>
            <el-slider v-model="gridSize" :min="10" :max="30" @change="handleGridSizeChange" />
          </div>
          
          <div class="preset-buttons">
            <el-button size="small" @click="setGridSize(15)">小号(15mm)</el-button>
            <el-button size="small" @click="setGridSize(20)">中号(20mm)</el-button>
            <el-button size="small" @click="setGridSize(25)">大号(25mm)</el-button>
          </div>
        </div>
        
        <div class="sub-section">
          <div class="slider-container">
            <span class="slider-label">格子间距: {{ gridMargin }}mm</span>
            <el-slider v-model="gridMargin" :min="0" :max="3" :step="0.5" />
          </div>
          
          <div class="slider-container">
            <span class="slider-label">行间距: {{ rowSpacing }}mm</span>
            <el-slider v-model="rowSpacing" :min="0" :max="10" :step="0.5" />
          </div>
        </div>
        
        <div class="checkbox-options">
          <el-checkbox v-model="showDiagonals">显示对角线(米字格)</el-checkbox>
        </div>
      </div>
      
      <!-- 页面设置 -->
      <div class="section">
        <h3>页面设置</h3>
        <div class="sub-section">
          <div class="slider-container">
            <span class="slider-label">页边距: {{ pageMargin }}mm</span>
            <el-slider v-model="pageMargin" :min="5" :max="30" />
          </div>
          <div class="description">
            统一设置页面四周边距（左右上下一致）
          </div>
        </div>
        
        <div class="font-settings">
          <h4>字体设置</h4>
          <div class="slider-container">
            <span class="slider-label">拼音字体: {{ Math.round(pinyinFontSize * 100) }}%</span>
            <el-slider v-model="pinyinFontSize" :min="0.2" :max="0.6" :step="0.01" />
          </div>
          
          <!-- 拼音字体选择 -->
          <div class="font-selection">
            <span class="font-label">拼音字体:</span>
            <el-select v-model="pinyinFontFamily" placeholder="选择拼音字体">
              <el-option label="Arial" value="Arial, sans-serif" />
              <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
              <el-option label="宋体" value="SimSun, serif" />
              <el-option label="黑体" value="SimHei, sans-serif" />
              <!-- 添加自定义字体选项 -->
              <el-option 
                v-for="font in customPinyinFonts" 
                :key="font.name" 
                :label="getFriendlyFontName(font)" 
                :value="font.name" 
              />
            </el-select>
          </div>
          
          <div class="slider-container">
            <span class="slider-label">汉字字体: {{ Math.round(characterFontSize * 100) }}%</span>
            <el-slider v-model="characterFontSize" :min="0.4" :max="0.8" :step="0.01" />
          </div>
          
          <!-- 汉字字体选择 -->
          <div class="font-selection">
            <span class="font-label">汉字字体:</span>
            <el-select v-model="characterFontFamily" placeholder="选择汉字字体">
              <el-option label="楷体" value="KaiTi, SimKai, serif" />
              <el-option label="宋体" value="SimSun, serif" />
              <el-option label="黑体" value="SimHei, sans-serif" />
              <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
              <!-- 添加自定义字体选项 -->
              <el-option 
                v-for="font in customCharacterFonts" 
                :key="font.name" 
                :label="getFriendlyFontName(font)" 
                :value="font.name" 
              />
            </el-select>
          </div>
          
          <div class="checkbox-options">
            <el-checkbox v-model="showPinyin">显示拼音(四线三格)</el-checkbox>
          </div>
        </div>
      </div>
      
      <!-- 添加字体上传部分 -->
      <div class="section">
        <h3>自定义字体</h3>
        <div class="sub-section">
          <div class="font-upload">
            <h4>上传自定义字体</h4>
            <div class="upload-description">
              支持上传TTF、OTF和WOFF格式字体文件
            </div>
            
            <!-- 拼音字体上传 -->
            <div class="upload-container">
              <span class="upload-label">拼音字体:</span>
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                accept=".ttf,.otf,.woff,.woff2"
                :on-change="(file: UploadFile) => handleFontUpload(file, 'pinyin')"
              >
                <el-button type="primary" plain size="small">
                  上传拼音字体
                </el-button>
              </el-upload>
            </div>
            
            <!-- 汉字字体上传 -->
            <div class="upload-container">
              <span class="upload-label">汉字字体:</span>
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                accept=".ttf,.otf,.woff,.woff2"
                :on-change="(file: UploadFile) => handleFontUpload(file, 'character')"
              >
                <el-button type="primary" plain size="small">
                  上传汉字字体
                </el-button>
              </el-upload>
            </div>
            
            <!-- 已上传的自定义字体列表 -->
            <div v-if="customFonts.length > 0" class="custom-fonts-list">
              <h4>已上传字体</h4>
              <ul>
                <li v-for="(font, index) in customFonts" :key="index">
                  {{ getFriendlyFontName(font) }} ({{ font.type === 'pinyin' ? '拼音' : '汉字' }})
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click="removeCustomFont(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 当前预览信息 -->
      <div class="section">
        <h3>当前预览信息</h3>
        <div class="info-box">
          <p>有效内容区域: {{ Math.round(effectiveWidth) }}mm × {{ Math.round(effectiveHeight) }}mm</p>
          <p>当前布局: {{ gridLayout.cols }}列 × {{ gridLayout.rows }}行/页</p>
          <p>每行容量: {{ gridLayout.cols }}个汉字 (标点占半格)</p>
          <p>行高: {{ gridLayout.rowHeight.toFixed(1) }}mm</p>
          <p>已生成页数: {{ totalPages }}页</p>
        </div>
      </div>
      
      <!-- 导出设置 -->
      <div class="section">
        <h3>导出设置</h3>
        <el-input v-model="filename" placeholder="文件名">
          <template #append>.pdf</template>
        </el-input>
        
        <div class="export-button">
          <el-button type="primary" @click="exportPDF">导出PDF</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useConfigStore } from '../stores/configStore';
import html2pdf from 'html2pdf.js';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Upload, Delete } from '@element-plus/icons-vue';
import { 
  processFont, 
  applyFontToTargets,
  createFontTestPanel,
  removeFont,
  type FontInfo
} from '../services/fontLoader';

const config = useConfigStore();

// 双向绑定配置参数
const content = computed({
  get: () => config.content,
  set: (val) => config.content = val
});

const mode = computed({
  get: () => config.mode,
  set: (val) => config.mode = val
});

const gridSize = computed({
  get: () => config.gridSize,
  set: (val) => config.gridSize = val
});

const gridMargin = computed({
  get: () => config.gridMargin,
  set: (val) => config.gridMargin = val
});

const rowSpacing = computed({
  get: () => config.rowSpacing,
  set: (val) => config.rowSpacing = val
});

const showDiagonals = computed({
  get: () => config.showDiagonals,
  set: (val) => config.showDiagonals = val
});

const pageMargin = computed({
  get: () => config.pageMargin,
  set: (val) => config.pageMargin = val
});

const pinyinFontSize = computed({
  get: () => config.pinyinFontSize,
  set: (val) => config.pinyinFontSize = val
});

const characterFontSize = computed({
  get: () => config.characterFontSize,
  set: (val) => config.characterFontSize = val
});

const pinyinFontFamily = computed({
  get: () => config.pinyinFontFamily,
  set: (val: string) => {
    console.log(`设置拼音字体为: ${val}`);
    config.pinyinFontFamily = val;
    // 通知用户字体已更新
    if (val && val !== 'Arial, Microsoft YaHei, sans-serif') {
      setTimeout(() => {
        ElMessage({
          message: `已应用拼音字体`,
          type: 'success',
          duration: 1000
        });
      }, 100);
    }
  }
});

const characterFontFamily = computed({
  get: () => config.characterFontFamily,
  set: (val: string) => {
    console.log(`设置汉字字体为: ${val}`);
    config.characterFontFamily = val;
    // 通知用户字体已更新
    if (val && val !== 'KaiTi, SimKai, Microsoft YaHei, sans-serif') {
      setTimeout(() => {
        ElMessage({
          message: `已应用汉字字体`,
          type: 'success',
          duration: 1000
        });
      }, 100);
    }
  }
});

const showPinyin = computed({
  get: () => config.showPinyin,
  set: (val) => config.showPinyin = val
});

const filename = computed({
  get: () => config.filename,
  set: (val) => config.filename = val
});

// 自定义字体相关
const customFonts = computed(() => config.customFonts);

// 显示友好的字体名称
const getFriendlyFontName = (font: {name: string, url: string, type: 'pinyin' | 'character', displayName?: string}) => {
  if (font.displayName) return font.displayName;
  // 如果没有displayName，从name中提取
  if (font.name.includes('custom_')) {
    const nameParts = font.name.split('_');
    // 跳过custom_type_timestamp_前缀
    return nameParts.length > 3 ? nameParts.slice(3).join('_') : font.name;
  }
  return font.name;
};

// 确保字体名称被正确加上引号 - 不再使用，直接传递原始字体名
const formatFontFamily = (fontName: string) => {
  return fontName;
};

// 过滤拼音字体和汉字字体
const customPinyinFonts = computed(() => 
  customFonts.value.filter(font => font.type === 'pinyin')
);

const customCharacterFonts = computed(() => 
  customFonts.value.filter(font => font.type === 'character')
);

// 自定义类型
interface UploadFile {
  name: string;
  raw: File;
  size: number;
  type: string;
  uid: number | string;
}

// 方法
const handleModeChange = (value: string) => {
  config.setMode(value);
  // 根据不同模式设置显示选项
  switch (value) {
    case 'write': // 看拼音写汉字
      config.showPinyin = true;
      config.showCharacter = false;
      break;
    case 'read': // 汉字注音
      config.showPinyin = true;
      config.showCharacter = true;
      break;
    case 'trace': // 描红练习
      config.showPinyin = false;
      config.showCharacter = true;
      break;
    default: // 正常模式
      config.showPinyin = true;
      config.showCharacter = true;
      break;
  }
};

const handleGridSizeChange = (value: number) => {
  config.setGridSize(value);
};

const setGridSize = (size: number) => {
  config.setGridSize(size);
};

// 恢复默认设置
const resetToDefaults = () => {
  // 使用Element Plus的确认对话框
  ElMessageBox.confirm(
    '确定要恢复所有设置为默认值吗？这将覆盖您当前的所有自定义设置。',
    '恢复默认设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      config.resetToDefaults();
      ElMessage({
        type: 'success',
        message: '已恢复默认设置',
      });
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 导出PDF
const exportPDF = () => {
  // 获取A4页面元素容器
  const container = document.querySelector('.pages-container');
  if (!container) {
    ElMessage.error('无法找到页面容器');
    return;
  }
  
  // 获取A4页面元素
  const elements = document.querySelectorAll('.a4-page');
  if (!elements || elements.length === 0) {
    ElMessage.error('没有找到任何页面');
    return;
  }
  
  // 临时隐藏页码指示器
  const pageIndicators = document.querySelectorAll('.page-indicator');
  pageIndicators.forEach(indicator => {
    if (indicator instanceof HTMLElement) {
      indicator.style.display = 'none';
    }
  });
  
  // 临时应用统一样式以确保一致性
  const tempStyle = document.createElement('style');
  tempStyle.id = 'temp-pdf-style';
  tempStyle.innerHTML = `
    .pages-container {
      display: block !important;
      width: 210mm !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .a4-page {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      padding: ${pageMargin.value}mm !important;
      margin-bottom: 0 !important;
      box-sizing: border-box !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      background-color: white !important;
    }
    .grid-content {
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .grid-row {
      justify-content: center !important;
      width: ${210 - (pageMargin.value * 2)}mm !important;
      display: flex !important;
      align-items: center !important;
    }
    /* 确保汉字在田字格中垂直居中 */
    .character {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      top: 0 !important;
      margin: auto !important;
    }
    /* 调整拼音位置在PDF导出时不影响汉字位置 */
    .pinyin {
      position: absolute !important;
      top: -32px !important;
      left: 0 !important;
      right: 0 !important;
      text-align: center !important;
      margin: 0 auto !important;
      transform: none !important;
      z-index: 2 !important;
      padding-bottom: 0 !important;
      line-height: 1 !important;
    }
    /* 处理PDF中带有下延部分的字母 */
    .pinyin[data-content*="z"],
    .pinyin[data-content*="g"],
    .pinyin[data-content*="y"],
    .pinyin[data-content*="p"],
    .pinyin[data-content*="q"],
    .pinyin[data-content*="j"] {
      top: -35px !important;
    }
    /* 针对不同字体大小特别调整 */
    .font-medium .pinyin {
      top: -38px !important;
    }
    .font-large .pinyin {
      top: -42px !important;
    }
  `;
  document.head.appendChild(tempStyle);
  
  // 显示导出提示
  if (elements.length === 1) {
    ElMessage({
      type: 'info',
      message: `正在导出PDF文档，请稍候...`,
      duration: 2000
    });
  } else {
    ElMessage({
      type: 'info',
      message: `正在导出${elements.length}页PDF文档，这可能需要一些时间，请稍候...`,
      duration: 3000
    });
  }
  
  // 更详细的PDF导出配置
  const opt = {
    margin: 0,
    filename: config.filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 3, // 增加缩放比例以获得更高质量
      useCORS: true,
      logging: true,
      ignoreElements: (element: Element) => element.classList.contains('page-indicator'),
      backgroundColor: '#ffffff',
      letterRendering: true, // 启用字母渲染，提高文字清晰度
      allowTaint: true, // 允许跨域图像
      imageTimeout: 5000, // 增加图像超时时间
      windowWidth: document.documentElement.offsetWidth, // 使用实际窗口宽度
      windowHeight: document.documentElement.offsetHeight, // 使用实际窗口高度
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true,
      hotfixes: ['px_scaling'],
      precision: 16, // 增加精度
    },
  };
  
  // 使用分页导出方法
  if (elements.length > 1) {
    // 多页导出
    const pdfPromises: Promise<Uint8Array>[] = [];
    
    // 为每个页面创建单独的PDF
    Array.from(elements).forEach((element, index) => {
      // 克隆原始样式
      const clonedStyle = tempStyle.cloneNode(true) as HTMLStyleElement;
      clonedStyle.id = `temp-pdf-style-${index}`;
      document.head.appendChild(clonedStyle);
      
      const singlePageOpt = {
        ...opt,
        filename: `temp-page-${index}.pdf`,
        html2canvas: {
          ...opt.html2canvas,
          scale: 2
        }
      };
      
      // 单独导出每一页
      const promise = html2pdf()
        .set(singlePageOpt)
        .from(element as HTMLElement)
        .outputPdf('arraybuffer') as Promise<Uint8Array>;
      
      pdfPromises.push(promise);
    });
    
    // 合并所有PDF
    Promise.all(pdfPromises)
      .then(async (pdfArrays) => {
        try {
          // 动态导入PDFLib
          const { PDFDocument } = await import('pdf-lib');
          
          // 创建新PDF文档
          const mergedPdf = await PDFDocument.create();
          
          // 逐个添加PDF页面，跳过空白页
          for (const pdfBytes of pdfArrays) {
            try {
              const pdf = await PDFDocument.load(pdfBytes);
              // 检查页面数量，确保不是空PDF
              const pageIndices = pdf.getPageIndices();
              
              if (pageIndices.length > 0) {
                // 只复制第一页，因为html2pdf有时会生成带有空白第二页的PDF
                const pagesToCopy = [pageIndices[0]];
                const pages = await mergedPdf.copyPages(pdf, pagesToCopy);
                
                for (const page of pages) {
                  mergedPdf.addPage(page);
                }
              }
            } catch (err) {
              console.error('处理单页PDF时出错:', err);
              // 继续处理下一页
              continue;
            }
          }
          
          // 保存合并后的PDF
          const mergedPdfBytes = await mergedPdf.save();
          const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = config.filename;
          link.click();
          
          // 清理
          pageIndicators.forEach(indicator => {
            if (indicator instanceof HTMLElement) {
              indicator.style.display = '';
            }
          });
          
          // 移除所有临时样式
          document.querySelectorAll('[id^="temp-pdf-style"]').forEach(el => el.remove());
          
          ElMessage({
            type: 'success',
            message: `PDF导出成功！`,
            duration: 2000
          });
        } catch (err: any) {
          ElMessage.error(`合并PDF失败: ${err.message || '未知错误'}`);
          
          // 恢复显示
          pageIndicators.forEach(indicator => {
            if (indicator instanceof HTMLElement) {
              indicator.style.display = '';
            }
          });
          
          // 移除所有临时样式
          document.querySelectorAll('[id^="temp-pdf-style"]').forEach(el => el.remove());
        }
      })
      .catch((err: Error) => {
        // 恢复页码指示器显示
        pageIndicators.forEach(indicator => {
          if (indicator instanceof HTMLElement) {
            indicator.style.display = '';
          }
        });
        
        // 移除所有临时样式
        document.querySelectorAll('[id^="temp-pdf-style"]').forEach(el => el.remove());
        
        ElMessage.error(`导出失败: ${err.message || '未知错误'}`);
      });
  } else {
    // 单页导出 - 使用改进的方法
    // 设置html2canvas选项以防止分页和空白页
    const singlePageOpt = {
      ...opt,
      html2canvas: {
        ...opt.html2canvas,
        windowWidth: 1200, // 固定宽度以避免自动分页
        windowHeight: 1697, // A4高度对应像素 (297mm)
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      },
      jsPDF: {
        ...opt.jsPDF,
        hotfixes: ['px_scaling'], // 使用像素缩放修复
        putTotalPages: false // 禁用总页数功能
      }
    };
    
    // 导出容器内的第一个页面，避免分页
    const firstPage = elements[0];
    
    html2pdf()
      .set(singlePageOpt)
      .from(firstPage as HTMLElement)
      .save()
      .then(() => {
        // 恢复页码指示器显示
        pageIndicators.forEach(indicator => {
          if (indicator instanceof HTMLElement) {
            indicator.style.display = '';
          }
        });
        
        // 移除临时样式
        const tempStyleElement = document.getElementById('temp-pdf-style');
        if (tempStyleElement) {
          tempStyleElement.remove();
        }
        
        ElMessage({
          type: 'success',
          message: `PDF导出成功！`,
          duration: 2000
        });
      }).catch((err: Error) => {
        // 恢复页码指示器显示
        pageIndicators.forEach(indicator => {
          if (indicator instanceof HTMLElement) {
            indicator.style.display = '';
          }
        });
        
        // 移除临时样式
        const tempStyleElement = document.getElementById('temp-pdf-style');
        if (tempStyleElement) {
          tempStyleElement.remove();
        }
        
        ElMessage.error(`导出失败: ${err.message || '未知错误'}`);
      });
  }
};

// 计算有效内容区域
const effectiveWidth = computed(() => gridLayout.value.width);
const effectiveHeight = computed(() => gridLayout.value.height);

// 获取网格布局信息
const gridLayout = computed(() => config.gridLayout);

// 计算总页数
const totalRows = computed(() => {
  return Math.ceil(config.characters.length / gridLayout.value.cols);
});

const totalPages = computed(() => {
  return Math.ceil(totalRows.value / gridLayout.value.rows);
});

// 处理文件上传
const handleFileUpload = (file: UploadFile) => {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target && typeof e.target.result === 'string') {
      // 读取成功后更新内容
      content.value = e.target.result;
      ElMessage({
        type: 'success',
        message: '文件内容已加载',
        duration: 2000
      });
    }
  };
  
  reader.onerror = () => {
    ElMessage.error('读取文件失败');
  };
  
  reader.readAsText(file.raw, 'UTF-8');
};

// 处理字体上传
const handleFontUpload = async (file: UploadFile, type: 'pinyin' | 'character') => {
  if (!file || !file.raw) return;
  
  // 检查文件类型
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !['ttf', 'otf', 'woff', 'woff2'].includes(fileExt)) {
    ElMessage.error('不支持的字体文件格式，请上传TTF、OTF、WOFF或WOFF2格式的字体文件');
    return;
  }
  
  // 限制文件大小为30MB
  if (file.size > 30 * 1024 * 1024) {
    ElMessage.error('字体文件过大，请上传小于30MB的字体文件');
    return;
  }
  
  // 显示加载中状态
  const loadingMsg = ElMessage({
    message: `正在加载${type === 'pinyin' ? '拼音' : '汉字'}字体，请稍候...`,
    type: 'info',
    duration: 0
  });
  
  try {
    console.log(`开始处理${type}字体: ${file.name}`);
    
    // 使用新的字体处理函数处理字体
    const fontInfo = await processFont(file.raw, type);
    
    // 添加到自定义字体列表
    config.customFonts.push({
      name: fontInfo.family,
      url: fontInfo.url || '',
      type: type,
      displayName: fontInfo.displayName
    });
    
    // 更新当前字体
    if (type === 'pinyin') {
      pinyinFontFamily.value = fontInfo.family;
      console.log(`拼音字体设置为: ${fontInfo.family} (${fontInfo.displayName})`);
    } else {
      characterFontFamily.value = fontInfo.family;
      console.log(`汉字字体设置为: ${fontInfo.family} (${fontInfo.displayName})`);
    }
    
    // 关闭加载提示
    loadingMsg.close();
    
    // 应用字体到所有目标元素
    applyFontToTargets(fontInfo);
    
    // 显示成功消息
    ElMessage({
      message: `${type === 'pinyin' ? '拼音' : '汉字'}字体 "${fontInfo.displayName}" 已上传并应用`,
      type: 'success',
      duration: 3000
    });
    
    // 显示字体测试面板
    createFontTestPanel(fontInfo);
    
  } catch (error) {
    console.error('字体上传错误:', error);
    loadingMsg.close();
    
    // 显示详细错误消息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    ElMessage({
      type: 'error',
      message: `字体上传失败: ${errorMessage}`,
      duration: 5000
    });
  }
};

// 创建字体测试面板
function createFontTestPanel(fontInfo: FontInfo) {
  // 移除可能已存在的面板
  const existingPanel = document.getElementById(`font-test-panel-${fontInfo.family}`);
  if (existingPanel) existingPanel.remove();
  
  // 创建测试面板
  const panel = document.createElement('div');
  panel.id = `font-test-panel-${fontInfo.family}`;
  panel.className = 'font-test-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 20px;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    max-height: 90vh;
    overflow-y: auto;
  `;
  
  // 设置面板内容
  panel.innerHTML = `
    <h3 style="margin-top:0;display:flex;justify-content:space-between;align-items:center;">
      字体测试: <span style="font-weight:normal;font-size:14px;color:#666;">${fontInfo.displayName}</span>
      <button id="close-${fontInfo.family}" style="background:none;border:none;cursor:pointer;font-size:20px;line-height:1;">×</button>
    </h3>
    
    <div style="margin:15px 0;padding:15px;background:#f8f9fa;border-radius:6px;">
      <div class="${fontInfo.family}-test" style="font-family: '${fontInfo.family}', ${fontInfo.type === 'character' ? 'KaiTi, serif' : 'Arial, sans-serif'} !important;">
        <div style="font-size:28px;margin-bottom:10px;">汉字示例：天地玄黄</div>
        <div style="font-size:20px;">ABCabc 123 测试效果</div>
      </div>
    </div>
    
    <div style="display:flex;justify-content:space-between;margin-top:20px;">
      <div style="font-size:13px;color:#666;">
        <div>加载状态: <span style="color:#34a853;">已加载 ✓</span></div>
        <div style="margin-top:5px;">类型: ${fontInfo.type === 'character' ? '汉字字体' : '拼音字体'}</div>
      </div>
      <button id="reload-${fontInfo.family}" class="el-button el-button--primary el-button--small">重新加载字体</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // 添加关闭事件
  document.getElementById(`close-${fontInfo.family}`)?.addEventListener('click', () => {
    panel.remove();
  });
  
  // 添加重新加载事件
  document.getElementById(`reload-${fontInfo.family}`)?.addEventListener('click', () => {
    // 重新应用字体
    reloadFont(fontInfo);
    
    // 提示用户
    ElMessage({
      message: '字体已重新加载',
      type: 'success',
      duration: 2000
    });
  });
  
  // 10秒后自动关闭
  setTimeout(() => {
    if (document.body.contains(panel)) {
      panel.remove();
    }
  }, 10000);
}

// 移除自定义字体
const removeCustomFont = (index: number) => {
  const font = customFonts.value[index];
  
  // 如果当前正在使用该字体，则重置为默认字体
  if (font.type === 'pinyin' && pinyinFontFamily.value === font.name) {
    pinyinFontFamily.value = 'Arial, "Microsoft YaHei", sans-serif';
  } else if (font.type === 'character' && characterFontFamily.value === font.name) {
    characterFontFamily.value = 'KaiTi, SimKai, "Microsoft YaHei", sans-serif';
  }
  
  // 使用增强型字体加载器移除字体
  removeFont(font.name);
  
  // 从列表中移除
  config.customFonts.splice(index, 1);
  
  ElMessage({
    type: 'success',
    message: '已移除字体',
    duration: 2000
  });
};

// 在字体变化时重新应用字体类
watch([characterFontFamily, pinyinFontFamily], () => {
  setTimeout(() => {
    applyCustomFonts();
  }, 100);
});

function applyCustomFonts() {
  // 获取所有文本元素
  const charElements = document.querySelectorAll('.character');
  const pinyinElements = document.querySelectorAll('.pinyin');
  
  // 应用当前字体设置
  if (characterFontFamily.value) {
    const fontInfo = getFontByFamily(characterFontFamily.value);
    if (fontInfo) {
      applyFontToTargets(fontInfo);
    }
  }
  
  if (pinyinFontFamily.value) {
    const fontInfo = getFontByFamily(pinyinFontFamily.value);
    if (fontInfo) {
      applyFontToTargets(fontInfo);
    }
  }
}

// 根据字体族名获取字体信息
function getFontByFamily(family: string): FontInfo | undefined {
  const customFont = config.customFonts.find(font => font.name === family);
  if (!customFont) return undefined;
  
  return {
    family: customFont.name,
    displayName: customFont.displayName || customFont.name,
    type: customFont.type,
    url: customFont.url,
    format: customFont.url?.split('.').pop() || 'ttf',
    isLoaded: true
  };
}

// 重新加载字体
function reloadFont(fontInfo: FontInfo) {
  // 提示用户
  ElMessage({
    message: '重新应用字体...',
    type: 'info',
    duration: 2000
  });
  
  // 重新应用字体
  applyFontToTargets(fontInfo);
}
</script>

<style scoped>
.config-panel {
  width: 100%;
  max-width: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section {
  margin-bottom: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

h4 {
  margin-top: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.slider-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.slider-label {
  min-width: 100px;
}

.preset-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.checkbox-options {
  margin-top: 10px;
}

.font-settings {
  margin-top: 15px;
}

.export-button {
  margin-top: 10px;
}

.sub-section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.card-header span {
  font-weight: 600;
  font-size: 16px;
}

.description {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
  margin-bottom: 10px;
  padding-left: 100px;
}

.info-box {
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 3px solid #409EFF;
}

.info-box p {
  margin: 5px 0;
  color: #606266;
  font-size: 13px;
}

@media print {
  .config-panel {
    display: none;
  }
}

.upload-file-container {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.font-selection {
  margin-top: 10px;
}

.font-label {
  margin-right: 10px;
}

.font-upload {
  margin-top: 10px;
}

.upload-description {
  color: #909399;
  font-size: 12px;
}

.upload-container {
  margin-top: 10px;
  margin-bottom: 10px;
}

.custom-fonts-list {
  margin-top: 10px;
}

.custom-fonts-list ul {
  list-style-type: none;
  padding: 0;
}

.custom-fonts-list li {
  margin-bottom: 5px;
}

.custom-fonts-list li button {
  margin-left: 10px;
}
</style> 