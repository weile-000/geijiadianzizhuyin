// 用于GitHub Pages的部署脚本
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 确保dist目录存在
const distPath = path.resolve('./dist');
if (!fs.existsSync(distPath)) {
  console.error('构建目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建.nojekyll文件防止GitHub Pages使用Jekyll处理
const nojekyllPath = path.join(distPath, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');

try {
  // 初始化临时git仓库
  console.log('初始化Git仓库...');
  execSync('cd dist && git init', { stdio: 'inherit' });
  
  // 添加所有文件
  console.log('添加文件到暂存区...');
  execSync('cd dist && git add .', { stdio: 'inherit' });
  
  // 提交更改
  console.log('提交更改...');
  execSync('cd dist && git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
  
  // 推送到GitHub Pages分支
  console.log('推送到GitHub Pages...');
  const githubUrl = 'https://github.com/weile-000/geijiadianzizhuyin.git';
  execSync(`cd dist && git push -f ${githubUrl} main:gh-pages`, { stdio: 'inherit' });
  
  console.log('部署成功！🚀');
} catch (error) {
  console.error('部署过程中发生错误:', error);
  process.exit(1);
} 