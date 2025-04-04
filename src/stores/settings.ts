import { defineStore } from 'pinia';
import { useConfigStore } from './configStore';
import { ref, watch } from 'vue';

// 定义类型扩展，包含私有属性
interface SettingsState {
  characterFontFamily: string;
  pinyinFontFamily: string;
  isInitialized: boolean;
  _watchersSetup?: boolean; // 私有属性，用于标记监听器是否设置
}

// 定义settings store，从configStore中获取字体相关设置
export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    characterFontFamily: '',
    pinyinFontFamily: '',
    isInitialized: false,
    _watchersSetup: false   // 初始化为false
  }),
  
  getters: {
    // 判断是否使用自定义字体
    isUsingCustomCharacterFont(): boolean {
      const config = useConfigStore();
      return config.customFonts.some(
        font => font.type === 'character' && font.name === this.characterFontFamily
      );
    },
    
    isUsingCustomPinyinFont(): boolean {
      const config = useConfigStore();
      return config.customFonts.some(
        font => font.type === 'pinyin' && font.name === this.pinyinFontFamily
      );
    }
  },
  
  actions: {
    // 从configStore同步字体设置
    syncFontSettings() {
      const configStore = useConfigStore();
      
      if (configStore.characterFontFamily) {
        this.characterFontFamily = configStore.characterFontFamily;
      }
      
      if (configStore.pinyinFontFamily) {
        this.pinyinFontFamily = configStore.pinyinFontFamily;
      }
      
      this.isInitialized = true;
      
      // 设置监听器以保持同步
      this.setupWatchers();
      
      // 记录同步完成
      console.log('字体设置已同步:', {
        characterFont: this.characterFontFamily,
        pinyinFont: this.pinyinFontFamily
      });
    },
    
    // 创建对font的监听器
    setupWatchers() {
      // 如果已经设置过监听器，则不重复设置
      if (this._watchersSetup) return;
      
      const configStore = useConfigStore();
      
      // 监听configStore的变化，更新本地字体设置
      watch(
        () => configStore.characterFontFamily,
        (newFont) => {
          if (newFont && newFont !== this.characterFontFamily) {
            this.characterFontFamily = newFont;
            console.log('同步更新汉字字体:', newFont);
          }
        }
      );
      
      watch(
        () => configStore.pinyinFontFamily,
        (newFont) => {
          if (newFont && newFont !== this.pinyinFontFamily) {
            this.pinyinFontFamily = newFont;
            console.log('同步更新拼音字体:', newFont);
          }
        }
      );
      
      // 监听本地字体的变化，更新configStore
      watch(
        () => this.characterFontFamily,
        (newFont) => {
          if (newFont && newFont !== configStore.characterFontFamily) {
            configStore.characterFontFamily = newFont;
            console.log('更新configStore汉字字体:', newFont);
          }
        }
      );
      
      watch(
        () => this.pinyinFontFamily,
        (newFont) => {
          if (newFont && newFont !== configStore.pinyinFontFamily) {
            configStore.pinyinFontFamily = newFont;
            console.log('更新configStore拼音字体:', newFont);
          }
        }
      );
      
      // 标记监听器已设置
      this._watchersSetup = true;
    },
    
    // 重置为默认字体
    resetFonts() {
      const configStore = useConfigStore();
      this.characterFontFamily = 'KaiTi, SimKai, Microsoft YaHei, sans-serif';
      this.pinyinFontFamily = 'Arial, Microsoft YaHei, sans-serif';
      
      // 同步到configStore
      configStore.characterFontFamily = this.characterFontFamily;
      configStore.pinyinFontFamily = this.pinyinFontFamily;
    }
  }
}); 