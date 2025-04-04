<script setup lang="ts">
import ConfigPanel from './components/ConfigPanel.vue';
import GridContainer from './components/GridContainer.vue';
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="header-title">
          <h1>新建路小学汉字拼音练习生成器</h1>
        </div>
      </el-header>
      
      <el-container>
        <el-aside width="420px" class="config-sidebar">
          <ConfigPanel />
        </el-aside>
        
        <el-main>
          <div class="preview-container">
            <h2 class="section-title">A4预览</h2>
            <GridContainer />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
/* 移除错误的导入 */
/* @import './assets/styles/main.css'; */

.app-container {
  min-height: 100vh;
}

.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
  text-align: center;
  padding: 0 20px;
}

.header-title h1 {
  margin: 0;
}

.config-sidebar {
  padding: 20px;
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
}

.el-main {
  padding: 20px;
  display: flex;
  justify-content: center;
  overflow: auto;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
  overflow: auto;
}

.section-title {
  color: #606266;
  margin-top: 0;
  margin-bottom: 20px;
}

@media print {
  .el-header, .config-sidebar, .section-title {
    display: none;
  }
  
  .el-main {
    padding: 0;
  }
  
  .el-container {
    display: block;
  }
  
  .el-aside {
    display: none;
  }
  
  .preview-container {
    align-items: flex-start;
  }
}

@media (max-width: 1200px) {
  .el-container {
    flex-direction: column;
  }
  
  .el-aside {
    width: 100% !important;
    max-width: 100%;
  }
}
</style>
