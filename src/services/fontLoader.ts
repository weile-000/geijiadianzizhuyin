/**
 * 增强型字体加载器
 * 提供可靠的字体处理和加载机制，解决中文路径和兼容性问题
 */

// 字体定义接口
export interface FontInfo {
  family: string;      // 字体CSS名称
  displayName: string; // 显示名称
  type: 'pinyin' | 'character'; // 字体类型：拼音或汉字
  url?: string;        // 字体URL（可选，用于原始Blob URL）
  dataUrl?: string;    // 数据URL（Base64编码的字体数据）
  format: string;      // 字体格式，如'ttf', 'woff2'等
  isLoaded: boolean;   // 是否已成功加载
}

// 已加载字体的内存缓存
const loadedFonts = new Map<string, FontInfo>();

// 设置样式时的ID前缀，用于管理和清理
const STYLE_PREFIX = 'enhanced-font-';

/**
 * 处理原始字体文件并创建字体信息
 * @param file 上传的文件对象
 * @param type A字体类型（拼音或汉字）
 */
export async function processFont(file: File, type: 'pinyin' | 'character'): Promise<FontInfo> {
  try {
    console.log(`开始处理字体文件: ${file.name}, 类型: ${type}, MIME: ${file.type}`);
    
    // 使用原始文件名作为显示名(移除扩展名)
    const originalName = file.name.replace(/\.[^/.]+$/, ""); 
    // 获取文件扩展名
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'ttf';
    
    // 使用原始名称作为字体家族名称 - 不再使用随机ID
    // 关键修改：保留原始字体名称，只添加时间戳确保唯一性
    const timestamp = Date.now();
    // 保留原始字体名称，但添加前缀确保唯一性
    const family = `custom_${originalName}_${timestamp}`; 
    
    console.log(`字体名称设置: 原始=${file.name}, 字体ID=${family}`);

    // 创建字体信息对象
    const fontInfo: FontInfo = {
      family,
      displayName: originalName,
      type,
      format: fileExt,
      isLoaded: false
    };
    
    // 直接读取为ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    console.log(`成功读取字体ArrayBuffer, 大小: ${arrayBuffer.byteLength} 字节`);
    
    // 创建Blob URL
    const mimeType = getMimeTypeForFont(fileExt);
    const blob = new Blob([arrayBuffer], {type: mimeType});
    const blobUrl = URL.createObjectURL(blob);
    fontInfo.url = blobUrl;
    
    // 同时创建Data URL作为备份
    const dataUrl = await arrayBufferToDataURL(arrayBuffer, mimeType);
    fontInfo.dataUrl = dataUrl;
    
    console.log(`已创建URLs - Blob: ${blobUrl.substring(0, 30)}..., DataURL长度: ${dataUrl.length}`);
    
    // 注册并加载字体
    const loadingResult = await registerAndLoadFont(fontInfo);
    if (!loadingResult) {
      console.warn(`字体注册可能失败: ${family}`);
    }
    
    // 存储在内存中
    loadedFonts.set(family, fontInfo);
    fontInfo.isLoaded = true;
    
    console.log(`字体处理完成: ${family} (${originalName})`);
    return fontInfo;
  } catch (error) {
    console.error('处理字体文件失败:', error);
    throw new Error(`字体处理失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取字体文件的MIME类型
 */
function getMimeTypeForFont(fileExt: string): string {
  switch(fileExt.toLowerCase()) {
    case 'ttf': return 'font/ttf';
    case 'otf': return 'font/otf';
    case 'woff': return 'font/woff';
    case 'woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

/**
 * 将ArrayBuffer转换为DataURL
 */
async function arrayBufferToDataURL(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  return new Promise((resolve) => {
    const blob = new Blob([buffer], {type: mimeType});
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        // 如果转换失败，返回一个空的data URL
        resolve(`data:${mimeType};base64,`);
      }
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * 读取文件为ArrayBuffer
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('读取文件失败：不是有效的ArrayBuffer'));
      }
    };
    
    reader.onerror = (event) => {
      console.error('文件读取错误:', event);
      reject(new Error('读取文件失败: ' + (reader.error?.message || '未知错误')));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 注册并加载字体 
 */
async function registerAndLoadFont(fontInfo: FontInfo): Promise<boolean> {
  try {
    console.log(`注册字体: ${fontInfo.family}`);
    
    // 获取URL
    const blobUrl = fontInfo.url || '';
    const dataUrl = fontInfo.dataUrl || '';
    
    // 1. 创建@font-face样式表
    const styleId = `${STYLE_PREFIX}${fontInfo.family}`;
    
    // 移除旧样式
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();
    
    // 创建新样式
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    
    styleEl.textContent = `
      /* 主要字体定义 */
      @font-face {
        font-family: "${fontInfo.family}";
        src: url("${blobUrl}") format("${fontInfo.format}");
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
      
      /* 备用字体定义 - 使用Data URL */
      @font-face {
        font-family: "${fontInfo.family}";
        src: url('${dataUrl}') format("${fontInfo.format}");
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
      
      /* CSS类选择器 */
      .${fontInfo.family.replace(/[^a-zA-Z0-9_-]/g, '_')} {
        font-family: "${fontInfo.family}", ${fontInfo.type === 'character' ? 'KaiTi, SimSun, serif' : 'Arial, sans-serif'} !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
    `;
    
    // 添加到文档头部
    document.head.insertBefore(styleEl, document.head.firstChild);
    
    // 2. 使用FontFace API加载
    try {
      console.log('使用FontFace API加载字体');
      const fontFace = new FontFace(fontInfo.family, `url("${blobUrl}")`, {
        display: 'block',
        weight: 'normal',
        style: 'normal'
      });
      
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      console.log('FontFace API加载成功');
    } catch (e) {
      console.warn('FontFace API加载失败，使用备用方法', e);
    }
    
    // 3. 创建强制加载元素
    const testId = `${STYLE_PREFIX}test-${fontInfo.family}`;
    const existingTest = document.getElementById(testId);
    if (existingTest) existingTest.remove();
    
    const testEl = document.createElement('div');
    testEl.id = testId;
    testEl.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      visibility: hidden;
      font-size: 48px;
      font-family: "${fontInfo.family}", sans-serif;
    `;
    testEl.textContent = '字体加载测试ABCabc123天地玄黄宇宙洪荒';
    document.body.appendChild(testEl);
    
    // 添加内嵌样式加强字体应用
    const innerStyle = document.createElement('style');
    innerStyle.textContent = `
      #${testId} {
        font-family: "${fontInfo.family}", sans-serif !important;
      }
    `;
    testEl.appendChild(innerStyle);
    
    // 4. 强制DOM重绘
    document.body.style.visibility = 'hidden';
    setTimeout(() => {
      document.body.style.visibility = 'visible';
    }, 50);
    
    // 5. 创建通知事件
    setTimeout(() => {
      const event = new CustomEvent('fontLoaded', {
        detail: fontInfo
      });
      document.dispatchEvent(event);
      console.log('已发送fontLoaded事件');
    }, 500);
    
    return true;
  } catch (error) {
    console.error('注册字体失败:', error);
    return false;
  }
}

/**
 * 应用字体到目标元素的封装方法
 */
export function applyFontToElement(element: HTMLElement, fontInfo: FontInfo): void {
  try {
    console.log(`应用字体到元素: ${fontInfo.family}`);
    
    // 清除已有字体设置
    element.style.removeProperty('font-family');
    
    // 移除可能存在的其他字体类
    Array.from(element.classList).forEach(cls => {
      if ((cls.includes('font_') || cls.includes('custom_') || 
           cls.startsWith('font-') || cls.endsWith('-font')) && 
          cls !== 'character-font-optimized' && cls !== 'pinyin-font-optimized') {
        element.classList.remove(cls);
      }
    });
    
    // 添加新字体类
    const fontClass = fontInfo.family.replace(/[^a-zA-Z0-9_-]/g, '_');
    element.classList.add(fontClass);
    
    // 添加优化类
    if (fontInfo.type === 'character') {
      element.classList.add('character-font-optimized');
    } else {
      element.classList.add('pinyin-font-optimized');
    }
    
    // 设置内联样式 - 直接使用!important确保最高优先级
    let fallbackFonts = fontInfo.type === 'character' 
      ? 'KaiTi, SimSun, serif' 
      : 'Arial, "Microsoft YaHei", sans-serif';
    
    // 使用内联样式强制应用字体
    element.style.fontFamily = `"${fontInfo.family}", ${fallbackFonts}`;
    element.style.cssText += `
      font-family: "${fontInfo.family}", ${fallbackFonts} !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      font-display: swap !important;
    `;
    
    // 设置数据属性供CSS选择器使用
    element.dataset.fontFamily = fontInfo.family;
    element.dataset.fontType = fontInfo.type;
    
    // 创建内部样式标签进一步提高优先级
    const styleId = `${STYLE_PREFIX}${Math.random().toString(36).slice(2, 8)}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      
      // 给元素添加ID用于更精确的CSS选择器
      if (!element.id) {
        element.id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      
      styleEl.textContent = `
        #${element.id} {
          font-family: "${fontInfo.family}", ${fallbackFonts} !important;
        }
      `;
      
      document.head.appendChild(styleEl);
    }
    
    console.log(`已应用字体 ${fontInfo.family} 到元素`);
  } catch (error) {
    console.error('应用字体到元素失败:', error);
  }
}

/**
 * 应用字体到所有目标元素
 * @param fontInfo 字体信息
 */
export function applyFontToTargets(fontInfo: FontInfo): void {
  try {
    const selectors = fontInfo.type === 'character' 
      ? '.apply-character-font, .character, .character-font'
      : '.apply-pinyin-font, .pinyin, .pinyin-font';
    
    document.querySelectorAll<HTMLElement>(selectors).forEach(el => {
      applyFontToElement(el, fontInfo);
    });
    
    // 添加全局样式确保字体应用
    const globalStyleId = `global-font-${fontInfo.family.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
    let globalStyle = document.getElementById(globalStyleId);
    if (!globalStyle) {
      globalStyle = document.createElement('style');
      globalStyle.id = globalStyleId;
      document.head.appendChild(globalStyle);
      
      const fontClass = fontInfo.family.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fontType = fontInfo.type === 'character' ? 'character' : 'pinyin';
      
      globalStyle.textContent = `
        /* 全局字体定义 */
        .${fontClass} {
          font-family: ${fontInfo.family}, ${fontInfo.type === 'character' ? 'KaiTi, SimKai, serif' : 'Arial, sans-serif'} !important;
        }
        
        /* 特定元素类型应用 */
        .${fontType} .${fontClass},
        .${fontType}.${fontClass},
        .apply-${fontType}-font .${fontClass},
        .apply-${fontType}-font.${fontClass} {
          font-family: ${fontInfo.family}, ${fontInfo.type === 'character' ? 'KaiTi, SimKai, serif' : 'Arial, sans-serif'} !important;
        }
      `;
    }
    
    console.log(`已应用字体 ${fontInfo.family} 到所有${fontInfo.type === 'character' ? '汉字' : '拼音'}元素`);
  } catch (error) {
    console.error('应用字体到目标元素失败:', error);
  }
}

/**
 * 根据名称获取字体信息
 */
export function getFontByName(fontName: string): FontInfo | undefined {
  return loadedFonts.get(fontName);
}

/**
 * 获取特定类型的字体列表
 */
export function getFontsByType(type: 'pinyin' | 'character'): FontInfo[] {
  return Array.from(loadedFonts.values()).filter(font => font.type === type);
}

/**
 * 创建字体测试面板
 */
export function createFontTestPanel(fontInfo: FontInfo): void {
  const panelId = `${STYLE_PREFIX}test-${fontInfo.family}`;
  
  // 移除可能存在的旧面板
  const existingPanel = document.getElementById(panelId);
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // 创建新面板
  const panel = document.createElement('div');
  panel.id = panelId;
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.right = '20px';
  panel.style.zIndex = '9999';
  panel.style.padding = '20px';
  panel.style.background = 'white';
  panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  panel.style.borderRadius = '8px';
  panel.style.border = '2px solid #4285f4';
  panel.style.maxWidth = '400px';
  panel.style.fontFamily = 'Arial, sans-serif'; // 初始使用默认字体
  
  // 为面板添加字体样式
  const fontType = fontInfo.type === 'character' ? 'KaiTi, SimKai, serif' : 'Arial, sans-serif';
  const panelStyle = document.createElement('style');
  panelStyle.textContent = `
    #${panelId} .font-test-content {
      font-family: "${fontInfo.family}", ${fontType} !important;
      line-height: 1.5;
      letter-spacing: normal;
      word-spacing: normal;
      text-transform: none;
      font-weight: normal;
      font-style: normal;
    }
    #${panelId} .font-test-item {
      margin-bottom: 8px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    #${panelId} .font-test-header {
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #${panelId} .font-test-footer {
      margin-top: 15px;
      font-size: 13px;
      color: #5f6368;
    }
    #${panelId} .font-test-status {
      font-weight: bold;
    }
    #${panelId} button {
      cursor: pointer;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
    }
    #${panelId} .close-btn {
      background: #f1f3f4;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #${panelId} .reload-btn {
      background: #1a73e8;
      color: white;
    }
    #${panelId} .status-loaded {
      color: #34a853;
    }
    #${panelId} .status-failed {
      color: #ea4335;
    }
    #${panelId} code {
      background: #f1f3f4;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }
  `;
  panel.appendChild(panelStyle);
  
  // 准备测试内容
  panel.innerHTML += `
    <div class="font-test-header">
      <span style="font-weight:bold;font-size:18px;">字体测试: ${fontInfo.displayName}</span>
      <button id="${panelId}-close" class="close-btn">×</button>
    </div>
    
    <div class="font-test-item">
      <div class="font-test-content" style="font-size:28px;">
        汉字示例：天地玄黄
      </div>
    </div>
    
    <div class="font-test-item">
      <div class="font-test-content" style="font-size:20px;">
        ABCabc 123 测试效果
      </div>
    </div>
    
    <div class="font-test-item">
      <div class="font-test-content" style="font-size:24px;">
        中国智造，惠及全球
      </div>
    </div>
    
    <div class="font-test-footer">
      <div>
        加载状态: <span class="font-test-status ${fontInfo.isLoaded ? 'status-loaded' : 'status-failed'}">
          ${fontInfo.isLoaded ? '已加载 ✓' : '未检测到 !'}
        </span>
      </div>
      <div style="margin-top:8px;">
        字体名称: <code>${fontInfo.family}</code>
      </div>
      <div style="margin-top:8px;">
        字体格式: <code>${fontInfo.format.toUpperCase()}</code>
      </div>
    </div>
    
    <div style="margin-top:15px;display:flex;justify-content:flex-end;">
      <button id="${panelId}-reload" class="reload-btn">重新加载</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // 应用字体到测试内容
  panel.querySelectorAll<HTMLElement>('.font-test-content').forEach(el => {
    applyFontToElement(el, fontInfo);
  });
  
  // 添加事件监听
  const closeBtn = document.getElementById(`${panelId}-close`);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.remove();
    });
  }
  
  const reloadBtn = document.getElementById(`${panelId}-reload`);
  if (reloadBtn) {
    reloadBtn.addEventListener('click', async () => {
      // 显示加载中状态
      reloadBtn.textContent = '加载中...';
      reloadBtn.setAttribute('disabled', 'true');
      
      // 重新加载字体
      await registerAndLoadFont(fontInfo);
      
      // 应用字体到所有目标
      applyFontToTargets(fontInfo);
      
      // 移除旧面板并创建新面板
      panel.remove();
      setTimeout(() => {
        createFontTestPanel(fontInfo); // 递归调用创建新面板
      }, 100);
    });
  }
  
  // 自动关闭
  setTimeout(() => {
    if (document.body.contains(panel)) {
      panel.remove();
    }
  }, 20000); // 20秒后自动关闭
}

/**
 * 移除字体
 */
export function removeFont(fontName: string): boolean {
  const fontInfo = loadedFonts.get(fontName);
  if (!fontInfo) return false;
  
  // 移除样式元素
  const styleId = `${STYLE_PREFIX}${fontInfo.family}`;
  const styleElement = document.getElementById(styleId);
  if (styleElement) styleElement.remove();
  
  // 移除预加载元素
  const preloadId = `${STYLE_PREFIX}preload-${fontInfo.family}`;
  const preloadElement = document.getElementById(preloadId);
  if (preloadElement) preloadElement.remove();
  
  // 移除强制器元素
  const forcerId = `${STYLE_PREFIX}forcer-${fontInfo.family}`;
  const forcerElement = document.getElementById(forcerId);
  if (forcerElement) forcerElement.remove();
  
  // 移除测试面板
  const panelId = `${STYLE_PREFIX}test-${fontInfo.family}`;
  const panelElement = document.getElementById(panelId);
  if (panelElement) panelElement.remove();
  
  // 从字体注册表移除
  try {
    const fontFace = document.fonts.forEach((face) => {
      if (face.family === fontInfo.family) {
        document.fonts.delete(face);
      }
    });
  } catch (e) {
    console.warn('移除FontFace失败:', e);
  }
  
  // 从缓存中移除
  loadedFonts.delete(fontName);
  
  return true;
} 