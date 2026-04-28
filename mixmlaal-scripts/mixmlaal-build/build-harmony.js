const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../../dist');
const targetDir = path.join(__dirname, '../../harmony/entry/src/main/resources/rawfile');

console.log('开始构建鸿蒙应用资源...');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(sourceDir)) {
  copyDir(sourceDir, targetDir);
  console.log('鸿蒙应用资源构建完成！');
} else {
  console.error('错误：dist目录不存在，请先运行 npm run build');
  process.exit(1);
}
