# 新建路小学汉字拼音练习生成器

一个基于Vue 3的网站应用，用于生成汉字拼音练习PDF文档，可打印成纸质版使用。

## 功能特点

- **A4纸格式预览**：所见即所得的A4页面展示
- **可调整田字格**：支持多种尺寸的田字格（大号25mm、中号20mm、小号15mm等）
- **多种练习模式**：
  - 正常模式：显示拼音和汉字
  - 看拼音写汉字：只显示拼音
  - 汉字注音：同时显示拼音和汉字
  - 描红练习：显示浅色汉字供描摹

- **自定义配置**：可调整田字格大小、页边距、显示样式等
- **一键导出PDF**：高质量PDF文件导出，适合打印

## 在线使用

访问 GitHub Pages 部署版本：[新建路小学汉字拼音练习生成器](https://weile-000.github.io/geijiadianzizhuyin/)

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus UI库
- Pinia 状态管理
- pinyin-pro 拼音处理
- html2pdf.js PDF生成

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build
```

## GitHub Pages 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages：

1. 将代码推送到 GitHub 仓库的 main 分支
2. GitHub Actions 会自动构建项目并部署到 GitHub Pages
3. 部署完成后，可通过 https://weile-000.github.io/geijiadianzizhuyin/ 访问

## 使用方法

1. 在内容设置区输入要练习的汉字文本
2. 选择练习模式（正常、写字、注音或描红）
3. 调整田字格大小和其他设置
4. 在A4预览区查看效果
5. 点击"导出PDF"按钮生成PDF文件
6. 打印PDF文件即可使用

## 打印建议

- 建议使用A4纸张打印
- 打印设置中选择"实际大小"或"100%缩放"
- 关闭页眉页脚
- 对于低年级学生建议使用大号田字格(25mm)
- 对于中高年级学生可使用中号(20mm)或小号(15mm)田字格
