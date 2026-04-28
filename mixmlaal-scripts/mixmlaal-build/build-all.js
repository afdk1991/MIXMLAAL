const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========== 开始全平台构建 ==========');

const platforms = [
  { name: 'Web', script: 'npm run build' },
  { name: '鸿蒙应用', script: 'npm run build:harmony' },
  { name: '多平台小程序', script: 'npm run build:miniapp' },
];

function runCommand(command, description) {
  try {
    console.log(`\n[${description}] 执行命令: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
    console.log(`[${description}] 完成 ✓`);
    return true;
  } catch (error) {
    console.error(`[${description}] 失败 ✗`);
    console.error(error.message);
    return false;
  }
}

let allSuccess = true;
for (const platform of platforms) {
  const success = runCommand(platform.script, platform.name);
  if (!success) {
    allSuccess = false;
  }
}

console.log('\n========== 构建结果 ==========');
if (allSuccess) {
  console.log('✓ 所有平台构建成功！');

  const outputDirs = [
    { path: 'dist', name: 'Web应用' },
    { path: 'harmony/entry/src/main/resources/rawfile', name: '鸿蒙应用资源' },
    { path: 'dist-miniapp', name: '多平台小程序' },
  ];

  console.log('\n输出目录:');
  outputDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../../', dir.path);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✓ ${dir.name}: ${fullPath}`);
    }
  });
} else {
  console.log('✗ 部分平台构建失败，请检查错误信息');
  process.exit(1);
}
