/**
 * 项目部署脚本
 * 版本: v2.0.0.0
 * 说明: 用于部署项目到本地环境
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始部署 MIXMLAAL 项目...');

try {
  // 检查是否需要构建
  console.log('📦 开始构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 本地部署配置
  const deployConfig = {
    deployPath: process.env.DEPLOY_PATH || path.join(__dirname, '../../mixmlaal-deploy'),
  };

  console.log('⚙️  部署配置:', deployConfig);

  // 确保部署目录存在
  console.log('📁 创建部署目录...');
  if (!fs.existsSync(deployConfig.deployPath)) {
    fs.mkdirSync(deployConfig.deployPath, { recursive: true });
  }

  // 清理目标目录
  console.log('🧹 清理目标目录...');
  const files = fs.readdirSync(deployConfig.deployPath);
  files.forEach(file => {
    const filePath = path.join(deployConfig.deployPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  });

  // 复制各个应用的构建产物
  const apps = ['mixmlaal-admin-vue', 'mixmlaal-frontend-vue', 'mixmlaal-driver-vue', 'mixmlaal-h5-vue', 'mixmlaal-merchant-vue', 'mixmlaal-admin-react'];
  apps.forEach(app => {
    const appBuildDir = path.join(__dirname, `../../mixmlaal-apps/${app}/dist`);
    if (fs.existsSync(appBuildDir)) {
      console.log(`📤 复制 ${app} 构建产物...`);
      const targetAppDir = path.join(deployConfig.deployPath, app);
      fs.mkdirSync(targetAppDir, { recursive: true });
      
      const buildFiles = fs.readdirSync(appBuildDir);
      buildFiles.forEach(file => {
        const sourcePath = path.join(appBuildDir, file);
        const targetPath = path.join(targetAppDir, file);
        if (fs.lstatSync(sourcePath).isDirectory()) {
          fs.cpSync(sourcePath, targetPath, { recursive: true });
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      });
    }
  });

  // 复制API服务
  console.log('📤 复制 API 服务...');
  const apiSourceDir = path.join(__dirname, '../../MIXMLAAL-apps/MIXMLAAL-api-node');
  const apiTargetDir = path.join(deployConfig.deployPath, 'api');
  fs.mkdirSync(apiTargetDir, { recursive: true });
  
  // 复制必要的API文件
  const apiFiles = ['package.json', 'package-lock.json', 'src', 'server.js', '.env.example'];
  apiFiles.forEach(file => {
    const sourcePath = path.join(apiSourceDir, file);
    const targetPath = path.join(apiTargetDir, file);
    if (fs.existsSync(sourcePath)) {
      if (fs.lstatSync(sourcePath).isDirectory()) {
        fs.cpSync(sourcePath, targetPath, { recursive: true });
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  });

  // 安装API依赖
  console.log('📦 安装 API 依赖...');
  execSync(`cd ${apiTargetDir} && npm install --production`, { stdio: 'inherit' });

  console.log('🎉 部署完成！');
  console.log(`📁 部署目录: ${deployConfig.deployPath}`);
  console.log('\n💡 提示:');
  console.log('1. 配置 API 服务的环境变量:');
  console.log(`   cd ${apiTargetDir} && cp .env.example .env`);
  console.log('2. 启动 API 服务:');
  console.log(`   cd ${apiTargetDir} && npm start`);
  console.log('3. 前端应用可以通过以下地址访问:');
  console.log('   - Admin: http://localhost:8080');
  console.log('   - Frontend: http://localhost:8084');
  console.log('   - Driver: http://localhost:8081');
  console.log('   - H5: http://localhost:8082');
  console.log('   - Merchant: http://localhost:8083');
  console.log('   - React Admin: http://localhost:8000');
} catch (error) {
  console.error('❌ 部署失败:', error);
  process.exit(1);
}
