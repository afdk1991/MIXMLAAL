/**
 * 项目构建脚本
 * 版本: v1.0.0.0
 * 说明: 用于构建前端和后端代码
 */

const fs = require('fs');
const path = require('path');
const { execSync: _execSync } = require('child_process');

console.log('🚀 开始构建 MIXMLAAL 项目...');

try {
  // 创建构建目录
  const buildDir = path.join(__dirname, '../../dist');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log('✅ 创建构建目录成功');
  }

  // 复制前端静态文件
  console.log('📁 复制前端静态文件...');
  const staticFiles = [
    'index.html',
    'assets',
    'src/portal',
    'src/ride',
    'src/ecommerce',
    'src/social',
  ];

  staticFiles.forEach(file => {
    const sourcePath = path.join(__dirname, '../../', file);
    const destPath = path.join(buildDir, file);

    if (fs.existsSync(sourcePath)) {
      if (fs.lstatSync(sourcePath).isDirectory()) {
        // 复制目录
        copyDirectory(sourcePath, destPath);
      } else {
        // 复制文件
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  });

  // 复制后端API代码
  console.log('🔧 复制后端API代码...');
  const apiSource = path.join(__dirname, '../../src/open/api');
  const apiDest = path.join(buildDir, 'api');
  copyDirectory(apiSource, apiDest);

  // 复制配置文件
  console.log('⚙️  复制配置文件...');
  const configFiles = [
    'package.json',
    'package-lock.json',
    'Dockerfile',
    'docker-compose.yml',
  ];

  configFiles.forEach(file => {
    const sourcePath = path.join(__dirname, '../../', file);
    const destPath = path.join(buildDir, file);

    if (fs.existsSync(sourcePath)) {
      if (fs.lstatSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, destPath);
      } else {
        // 确保目标目录存在
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  });

  // 复制nginx配置
  console.log('🔧 复制Nginx配置...');
  const nginxSource = path.join(__dirname, '../../nginx');
  const nginxDest = path.join(buildDir, 'nginx');
  if (fs.existsSync(nginxSource)) {
    copyDirectory(nginxSource, nginxDest);
  }

  // 复制数据库脚本
  console.log('🗃️  复制数据库脚本...');
  const dbSource = path.join(__dirname, '../../scripts/database');
  const dbDest = path.join(buildDir, 'scripts/database');
  copyDirectory(dbSource, dbDest);

  console.log('🎉 构建完成！');
  console.log(`📦 构建产物位于: ${buildDir}`);
} catch (error) {
  console.error('❌ 构建失败:', error);
  process.exit(1);
}

/**
 * 复制目录
 * @param {string} source - 源目录
 * @param {string} destination - 目标目录
 */
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}
