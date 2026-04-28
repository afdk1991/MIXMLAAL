const fs = require('fs');
const path = require('path');

const platforms = ['wechat', 'alipay', 'baidu', 'bytedance'];
const sourceDir = path.join(__dirname, '../../miniapp');
const distDir = path.join(__dirname, '../../dist-miniapp');

console.log('开始构建多平台小程序...');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) { continue; }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildPlatform(platform) {
  const platformDistDir = path.join(distDir, platform);
  console.log(`构建 ${platform} 小程序...`);

  copyDir(sourceDir, platformDistDir, ['platforms']);

  const platformConfigDir = path.join(sourceDir, 'platforms', platform);
  if (fs.existsSync(platformConfigDir)) {
    copyDir(platformConfigDir, platformDistDir);
  }

  const adapterPath = path.join(sourceDir, 'platforms', 'adapter.js');
  const adapterDestPath = path.join(platformDistDir, 'utils', 'platform.js');
  if (fs.existsSync(adapterPath)) {
    if (!fs.existsSync(path.dirname(adapterDestPath))) {
      fs.mkdirSync(path.dirname(adapterDestPath), { recursive: true });
    }
    fs.copyFileSync(adapterPath, adapterDestPath);
  }

  console.log(`${platform} 小程序构建完成！`);
}

platforms.forEach(platform => buildPlatform(platform));
console.log('所有平台小程序构建完成！');
