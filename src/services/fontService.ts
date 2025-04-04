/**
 * 字体加载服务
 * 处理字体加载、预加载和管理
 */

interface FontDefinition {
  family: string;
  url: string;
  format: string;
  type: 'pinyin' | 'character';
  displayName?: string;
}

// 已加载的字体缓存
const loadedFonts = new Map<string, FontFace>();
// 加载中的字体 Promise
const loadingFonts = new Map<string, Promise<FontFace>>();
// 已完成的字体样式元素
const createdStyles = new Map<string, HTMLStyleElement>();

/**
 * 生成安全的字体名称 - 确保无论在CSS还是JS中都可以安全使用
 */
function safeQuote(name: string): string {
  // 如果字体名称包含空格或特殊符号，需要加引号，否则不需要
  return /[ '"!@#$%^&*()+=[\]{}|\\:;,.<>/?]/.test(name) ? `"${name}"` : name;
}

/**
 * 预加载一个字体文件
 * @param fontDef 字体定义
 * @returns Promise<FontFace> 字体对象
 */
export async function preloadFont(fontDef: FontDefinition): Promise<FontFace> {
  const { family, url, format } = fontDef;
  
  // 如果字体已加载，直接返回
  if (loadedFonts.has(family)) {
    return loadedFonts.get(family)!;
  }
  
  // 如果字体正在加载，返回正在加载的 Promise
  if (loadingFonts.has(family)) {
    return loadingFonts.get(family)!;
  }
  
  // 创建加载 Promise
  const loadPromise = new Promise<FontFace>((resolve, reject) => {
    try {
      console.log(`开始加载字体: ${family}`);
      
      // 清理可能存在的旧样式
      const existingStyle = document.getElementById(`font-style-${family}`);
      if (existingStyle) {
        console.log(`移除已存在的同名样式: ${family}`);
        existingStyle.remove();
      }
      
      // 使用安全的Base64嵌入方式处理可能的中文路径问题
      loadFontToBase64(url).then(dataUrl => {
        // 添加CSS @font-face
        const style = document.createElement('style');
        style.id = `font-style-${family}`;
        style.textContent = `
          @font-face {
            font-family: ${family};
            src: url(${dataUrl}) format('${format}');
            font-weight: normal;
            font-style: normal;
            font-display: block;
          }
        `;
        document.head.appendChild(style);
        createdStyles.set(family, style);
        
        // 使用FontFace API加载字体
        const fontFace = new FontFace(family, `url(${dataUrl})`);
        
        fontFace.load().then(loaded => {
          console.log(`字体成功加载: ${family}`);
          document.fonts.add(loaded);
          loadedFonts.set(family, loaded);
          
          // 验证字体是否实际被应用
          verifyFontLoaded(family).then(isLoaded => {
            if (isLoaded) {
              console.log(`字体验证通过: ${family}`);
              resolve(loaded);
            } else {
              console.warn(`字体验证失败，尝试备用方案: ${family}`);
              // 使用备用方案强制应用字体
              forceApplyFont(family, dataUrl, format);
              resolve(loaded); // 仍然返回加载对象，即使验证失败
            }
          });
        }).catch(err => {
          console.warn(`FontFace API加载失败: ${family}`, err);
          // 使用备用方案
          forceApplyFont(family, dataUrl, format);
          
          // 创建一个空的FontFace对象作为替代
          const fallbackFont = new FontFace(family, `url(${dataUrl})`);
          loadedFonts.set(family, fallbackFont);
          resolve(fallbackFont);
        });
      }).catch(err => {
        console.error(`无法将字体转换为Base64: ${family}`, err);
        reject(err);
      });
    } catch (err) {
      console.error(`字体加载出错: ${family}`, err);
      reject(err);
    }
  });
  
  // 存储加载 Promise
  loadingFonts.set(family, loadPromise);
  
  // 添加超时处理
  setTimeout(() => {
    if (loadingFonts.has(family) && !loadedFonts.has(family)) {
      console.warn(`字体加载超时: ${family}`);
      // 移除加载中状态
      loadingFonts.delete(family);
    }
  }, 5000);
  
  return loadPromise;
}

/**
 * 强制应用字体的备用方案
 */
function forceApplyFont(family: string, dataUrl: string, format: string) {
  console.log(`使用备用方案应用字体: ${family}`);
  
  // 首先清理可能存在的失败样式
  const existingBackup = document.getElementById(`font-backup-${family}`);
  if (existingBackup) {
    existingBackup.remove();
  }
  
  // 创建一个更简单的字体名称作为备用
  const backupName = `${family}_backup`;
  
  // 方法1: 使用更严格的CSS字体定义
  const backupStyle = document.createElement('style');
  backupStyle.id = `font-backup-${family}`;
  backupStyle.textContent = `
    @font-face {
      font-family: ${family};
      src: url(${dataUrl}) format('${format}');
      font-weight: normal;
      font-style: normal;
      font-display: block !important;
    }
    
    @font-face {
      font-family: "${family}";
      src: url(${dataUrl}) format('${format}');
      font-weight: normal;
      font-style: normal;
      font-display: block !important;
    }
    
    @font-face {
      font-family: ${backupName};
      src: url(${dataUrl}) format('${format}');
      font-weight: normal;
      font-style: normal;
      font-display: block !important;
    }
    
    /* 确保使用类应用的元素能正确显示字体 */
    .${family.replace(/[^a-zA-Z0-9]/g, '_')}-applied {
      font-family: ${family}, ${backupName}, FallbackSerif, serif !important;
    }
    
    /* 直接使用字体名称的元素也能应用 */
    [style*="font-family: ${family}"],
    [style*='font-family: "${family}"'] {
      font-family: ${family}, ${backupName}, FallbackSerif, serif !important;
    }
  `;
  document.head.appendChild(backupStyle);
  
  // 方法2: 使用字体加载API
  if (document.fonts && document.fonts.add) {
    try {
      // 尝试直接添加字体
      const fontFace = new FontFace(family, `url(${dataUrl})`, {
        display: 'block',
        weight: 'normal',
        style: 'normal'
      });
      
      fontFace.load().then(loaded => {
        console.log(`备用方案加载成功: ${family}`);
        document.fonts.add(loaded);
      }).catch(err => {
        console.warn(`备用方案加载失败: ${family}`, err);
      });
      
      // 同时尝试加载备用名称
      const backupFace = new FontFace(backupName, `url(${dataUrl})`, {
        display: 'block',
        weight: 'normal',
        style: 'normal'
      });
      
      backupFace.load().then(loaded => {
        console.log(`备用字体加载成功: ${backupName}`);
        document.fonts.add(loaded);
        
        // 添加到缓存
        loadedFonts.set(backupName, loaded);
      }).catch(err => {
        console.warn(`备用字体加载失败: ${backupName}`, err);
      });
    } catch (err) {
      console.warn(`备用方案API调用失败:`, err);
    }
  }
  
  // 方法3: 使用预加载
  const link = document.createElement('link');
  link.id = `font-preload-${family}`;
  link.rel = 'preload';
  link.as = 'font';
  link.href = dataUrl;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
  
  // 方法4: 创建隐藏元素强制加载字体
  setTimeout(() => {
    const container = document.createElement('div');
    container.id = `font-force-${family}`;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.visibility = 'hidden';
    container.innerHTML = `
      <div style="font-family: ${family}, serif; font-size: 30px;">汉字测试ABCabc</div>
      <div style="font-family: ${backupName}, serif; font-size: 30px;">汉字测试ABCabc</div>
      <div class="${family.replace(/[^a-zA-Z0-9]/g, '_')}-applied">类名测试</div>
    `;
    
    document.body.appendChild(container);
    
    // 1秒后移除，但保留字体
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }, 3000);
  }, 100);
}

/**
 * 将字体URL转换为Base64，解决中文路径问题
 */
async function loadFontToBase64(url: string): Promise<string> {
  try {
    // 如果已经是Data URL，直接返回
    if (url.startsWith('data:')) {
      return url;
    }
    
    console.log(`尝试加载字体URL: ${url}`);
    
    // 获取字体二进制数据
    const response = await fetch(url, {
      // 添加必要的请求头，避免CORS和缓存问题
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // 确保不使用缓存
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`无法加载字体: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log(`已获取字体二进制数据，大小: ${buffer.byteLength} 字节`);
    
    // 使用更安全的方式转换二进制数据到Base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 1024;
    
    // 分块处理大文件，避免内存问题
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
      chunk.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
    }
    
    // 确定MIME类型
    let mimeType = 'application/octet-stream';
    if (url.endsWith('.ttf')) mimeType = 'font/ttf';
    else if (url.endsWith('.otf')) mimeType = 'font/otf';
    else if (url.endsWith('.woff')) mimeType = 'font/woff';
    else if (url.endsWith('.woff2')) mimeType = 'font/woff2';
    
    try {
      const base64 = btoa(binary);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      console.log(`字体已转换为Base64，长度: ${dataUrl.length}`);
      return dataUrl;
    } catch (e) {
      console.error('转换Base64出错:', e);
      throw new Error('字体文件转换失败，请尝试其他格式的字体');
    }
  } catch (error) {
    console.error('加载字体出错:', error);
    throw error;
  }
}

/**
 * 验证字体是否真正加载
 */
async function verifyFontLoaded(family: string): Promise<boolean> {
  return new Promise(resolve => {
    console.log(`开始验证字体是否加载: ${family}`);
    
    // 确保字体名称是安全的
    const fontFamily = family.includes(' ') ? `"${family}"` : family;
    
    // 创建一个iframe隔离环境进行测试，避免样式影响
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '500px';
    iframe.style.height = '200px';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
    
    // 确保iframe加载完成
    iframe.onload = () => {
      try {
        if (!iframe.contentDocument) {
          throw new Error('无法访问iframe内容');
        }
        
        const doc = iframe.contentDocument;
        
        // 创建测试元素
        const testBase = doc.createElement('div');
        testBase.style.fontFamily = 'serif';
        testBase.style.fontSize = '50px';
        testBase.style.position = 'absolute';
        testBase.style.visibility = 'hidden';
        testBase.textContent = '汉字测试123ABCabc';
        doc.body.appendChild(testBase);
        
        // 克隆元素应用测试字体
        const testFont = testBase.cloneNode(true) as HTMLElement;
        testFont.style.fontFamily = `${fontFamily}, serif`;
        doc.body.appendChild(testFont);
        
        // 为iframe文档添加字体样式
        const style = doc.createElement('style');
        style.textContent = `
          @font-face {
            font-family: ${family};
            font-weight: normal;
            font-style: normal;
          }
        `;
        doc.head.appendChild(style);
        
        // 比较三种方式: 宽度、像素数据和计算样式
        setTimeout(() => {
          try {
            // 1. 宽度比较
            const baseWidth = testBase.offsetWidth;
            const fontWidth = testFont.offsetWidth;
            const widthDifferent = Math.abs(baseWidth - fontWidth) > 1;
            
            // 2. 计算样式比较
            const baseStyle = getComputedStyle(testBase);
            const fontStyle = getComputedStyle(testFont);
            const fontFamilyDifferent = baseStyle.fontFamily !== fontStyle.fontFamily;
            
            // 3. 渲染结果比较
            let pixelDifferent = false;
            
            // 尝试比较Canvas像素数据
            try {
              const canvas1 = doc.createElement('canvas');
              const canvas2 = doc.createElement('canvas');
              canvas1.width = canvas2.width = 300;
              canvas1.height = canvas2.height = 100;
              
              const ctx1 = canvas1.getContext('2d');
              const ctx2 = canvas2.getContext('2d');
              
              if (ctx1 && ctx2) {
                ctx1.font = '30px serif';
                ctx2.font = `30px ${fontFamily}, serif`;
                
                ctx1.fillText('汉字测试', 10, 50);
                ctx2.fillText('汉字测试', 10, 50);
                
                // 比较像素数据
                const data1 = ctx1.getImageData(0, 0, 300, 100).data;
                const data2 = ctx2.getImageData(0, 0, 300, 100).data;
                
                // 检查是否有任何像素不同
                let differentPixels = 0;
                for (let i = 0; i < data1.length; i += 4) {
                  if (data1[i] !== data2[i] || 
                      data1[i+1] !== data2[i+1] || 
                      data1[i+2] !== data2[i+2]) {
                    differentPixels++;
                  }
                }
                
                pixelDifferent = differentPixels > 100; // 设置合理阈值
              }
            } catch (e) {
              console.warn('Canvas像素比较失败:', e);
            }
            
            const isLoaded = widthDifferent || fontFamilyDifferent || pixelDifferent;
            
            console.log(`字体加载验证结果 ${family}:`, {
              widthDifferent, 
              fontFamilyDifferent,
              pixelDifferent,
              baseWidth,
              fontWidth,
              baseStyle: baseStyle.fontFamily,
              fontStyle: fontStyle.fontFamily,
              conclusion: isLoaded ? '已加载' : '未加载'
            });
            
            // 清理测试元素
            doc.body.removeChild(testBase);
            doc.body.removeChild(testFont);
            document.body.removeChild(iframe);
            
            resolve(isLoaded);
          } catch (e) {
            console.error('字体验证出错:', e);
            document.body.removeChild(iframe);
            resolve(false); // 出错时默认为未加载
          }
        }, 200); // 延长验证时间
      } catch (e) {
        console.error('创建字体验证环境失败:', e);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve(false);
      }
    };
    
    // 处理iframe加载失败的情况
    iframe.onerror = () => {
      console.error('iframe加载失败');
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve(false);
    };
    
    // 设置空白HTML
    iframe.srcdoc = '<!DOCTYPE html><html><head></head><body></body></html>';
    
    // 设置超时，防止无限等待
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        console.warn('字体验证超时');
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * 从 Blob 创建字体
 * @param arrayBuffer 字体数据
 * @param fileType 文件类型
 * @param type 字体类型
 * @returns 字体定义
 */
export function createFontFromBuffer(
  arrayBuffer: ArrayBuffer,
  fileType: string,
  type: 'pinyin' | 'character',
  displayName: string
): FontDefinition {
  // 创建更简短且安全的字体名称
  const timestamp = Date.now();
  const shortTimestamp = timestamp.toString().slice(-6);
  
  // 确保字体名称不包含特殊字符
  const family = `font${type.charAt(0)}${shortTimestamp}`;
  console.log(`创建字体: ${family}, 类型: ${type}, 显示名称: ${displayName}`);
  
  // 确定正确的MIME类型
  const mimeType = 
    fileType === 'ttf' ? 'font/ttf' : 
    fileType === 'otf' ? 'font/otf' : 
    fileType === 'woff' ? 'font/woff' : 'font/woff2';
  
  // 创建Blob并生成URL
  const fontBlob = new Blob([arrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(fontBlob);
  
  return {
    family,
    url,
    format: fileType,
    type,
    displayName
  };
}

/**
 * 从系统中删除字体
 * @param family 字体名称
 */
export function removeFont(family: string): void {
  // 移除字体样式
  const styleElement = document.getElementById(`font-style-${family}`);
  if (styleElement) {
    console.log(`移除字体样式: ${family}`);
    styleElement.remove();
  }
  
  // 移除备用样式
  const backupStyle = document.getElementById(`font-backup-${family}`);
  if (backupStyle) {
    console.log(`移除备用样式: ${family}`);
    backupStyle.remove();
  }
  
  // 移除预加载
  const preloadLink = document.getElementById(`font-preload-${family}`);
  if (preloadLink) {
    console.log(`移除预加载链接: ${family}`);
    preloadLink.remove();
  }
  
  // 尝试从document.fonts中移除
  try {
    const fontFace = loadedFonts.get(family);
    if (fontFace) {
      console.log(`从document.fonts中移除: ${family}`);
      document.fonts.delete(fontFace);
    }
  } catch (err) {
    console.warn(`从document.fonts移除失败: ${family}`, err);
  }
  
  // 清理缓存
  loadedFonts.delete(family);
  loadingFonts.delete(family);
  createdStyles.delete(family);
}

/**
 * 测试字体是否加载正确
 * @param family 字体名称
 */
export function testFontLoaded(family: string): Promise<boolean> {
  return verifyFontLoaded(family);
}

/**
 * 显示字体测试面板
 * @param family 字体名称
 * @param displayName 显示名称
 */
export function showFontTestPanel(family: string, displayName: string): void {
  console.log(`显示字体测试面板: ${family} (${displayName})`);
  
  // 移除可能已存在的测试面板
  const existingPanel = document.getElementById(`font-test-${family}`);
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // 创建测试面板
  const panel = document.createElement('div');
  panel.id = `font-test-${family}`;
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.right = '20px';
  panel.style.zIndex = '9999';
  panel.style.padding = '20px';
  panel.style.backgroundColor = '#fff';
  panel.style.border = '2px solid #4285f4';
  panel.style.borderRadius = '8px';
  panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  panel.style.minWidth = '300px';
  panel.style.maxWidth = '400px';
  
  // 添加应用字体的类名
  const safeClassname = family.replace(/[^a-zA-Z0-9]/g, '_') + '-applied';
  const backupFamily = `${family}_backup`;
  panel.classList.add(safeClassname);
  
  // 添加强制CSS样式
  const panelStyle = document.createElement('style');
  panelStyle.textContent = `
    #font-test-${family} .test-text {
      font-family: ${family}, ${backupFamily}, 'FallbackSerif', serif !important;
    }
    #font-test-${family} .test-pinyin {
      font-family: ${family}, ${backupFamily}, 'FallbackSans', sans-serif !important;
    }
  `;
  document.head.appendChild(panelStyle);
  
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
      <span style="font-weight:bold;font-size:18px;color:#333;">字体测试: ${displayName}</span>
      <button id="close-${family}" style="border:none;background:#f0f0f0;cursor:pointer;font-size:20px;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#666;">×</button>
    </div>
    <div style="margin-bottom:20px;padding:15px;border:1px solid #e0e0e0;border-radius:6px;background:#fafafa;">
      <div class="test-text" style="font-size:28px;margin-bottom:12px;line-height:1.4;color:#333;">
        汉字测试: 天地玄黄
      </div>
      <div class="test-text" style="font-size:24px;margin-bottom:12px;color:#555;">
        ABCabc 123 测试
      </div>
      <div class="test-pinyin" style="font-size:18px;color:#777;">
        拼音测试: tiān dì xuán huáng
      </div>
    </div>
    <div style="font-size:14px;color:#666;border-top:1px solid #eee;padding-top:10px;">
      字体加载状态: <span id="font-status-${family}" style="font-weight:bold;color:#4285f4;">检测中...</span><br>
      <span style="font-size:12px;margin-top:6px;display:block;">字体CSS名称: <code style="background:#f5f5f5;padding:2px 4px;border-radius:3px;font-family:monospace;">${family}</code></span>
    </div>
    <div id="font-actions-${family}" style="margin-top:10px;display:flex;justify-content:space-between;">
      <button id="refresh-${family}" style="background:#4285f4;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:13px;">刷新测试</button>
      <button id="reload-${family}" style="background:#fbbc05;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:13px;">重新加载</button>
    </div>
  `;
  
  // 添加到文档
  document.body.appendChild(panel);
  
  // 添加动作事件处理
  document.getElementById(`close-${family}`)?.addEventListener('click', () => {
    document.body.removeChild(panel);
    panelStyle.remove();
  });
  
  document.getElementById(`refresh-${family}`)?.addEventListener('click', () => {
    checkAndUpdateStatus();
  });
  
  document.getElementById(`reload-${family}`)?.addEventListener('click', () => {
    const statusEl = document.getElementById(`font-status-${family}`);
    if (statusEl) {
      statusEl.textContent = '重新加载中...';
      statusEl.style.color = '#fbbc05';
    }
    
    // 尝试强制应用字体
    if (loadedFonts.has(family)) {
      const font = loadedFonts.get(family)!;
      loadFontToBase64(font.family).then(dataUrl => {
        forceApplyFont(family, dataUrl, family.endsWith('woff2') ? 'woff2' : 'ttf');
        setTimeout(checkAndUpdateStatus, 1000);
      }).catch(err => {
        console.error('重新加载字体失败:', err);
        if (statusEl) {
          statusEl.textContent = '加载失败';
          statusEl.style.color = '#ea4335';
        }
      });
    }
  });
  
  // 验证字体是否确实加载并更新状态
  function checkAndUpdateStatus() {
    const statusEl = document.getElementById(`font-status-${family}`);
    if (!statusEl) return;
    
    statusEl.textContent = '检测中...';
    statusEl.style.color = '#fbbc05';
    
    verifyFontLoaded(family).then(isLoaded => {
      if (!statusEl) return; // 防止面板已被关闭
      
      if (isLoaded) {
        statusEl.textContent = '已加载成功 ✓';
        statusEl.style.color = '#34a853';
      } else {
        statusEl.textContent = '加载异常 !';
        statusEl.style.color = '#ea4335';
        
        // 添加警告消息
        if (!document.getElementById(`font-warning-${family}`)) {
          const warningMsg = document.createElement('div');
          warningMsg.id = `font-warning-${family}`;
          warningMsg.style.color = '#ea4335';
          warningMsg.style.marginTop = '8px';
          warningMsg.style.fontSize = '13px';
          warningMsg.style.borderTop = '1px dashed #ea4335';
          warningMsg.style.paddingTop = '8px';
          warningMsg.innerHTML = '警告: 字体可能未正确加载，请尝试重新上传字体文件或使用其他格式的字体，如TTF格式';
          
          // 添加到操作区域之前
          const actionsEl = document.getElementById(`font-actions-${family}`);
          if (actionsEl && actionsEl.parentNode) {
            actionsEl.parentNode.insertBefore(warningMsg, actionsEl);
          }
        }
      }
    });
  }
  
  // 初始检查
  setTimeout(checkAndUpdateStatus, 1000);
  
  // 10秒后自动关闭（增加时间确保用户能看清效果）
  setTimeout(() => {
    if (document.body.contains(panel)) {
      document.body.removeChild(panel);
      panelStyle.remove();
    }
  }, 10000);
} 