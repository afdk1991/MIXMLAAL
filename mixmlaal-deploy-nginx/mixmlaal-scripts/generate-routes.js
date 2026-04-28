#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '../../mixmlaal-apps');

const modules = fs.readdirSync(appsDir)
  .filter(item => {
    const itemPath = path.join(appsDir, item);
    return fs.statSync(itemPath).isDirectory() && item.startsWith('mixmlaal-');
  })
  .map(item => {
    const name = item.replace(/^mixmlaal-/, '');
    const parts = name.split('-');
    const route = parts[0];
    const tech = parts.slice(1).join('-') || 'web';

    return {
      original: item,
      name: name,
      route: `/${route}`,
      tech: tech,
      port: 3000 + fs.readdirSync(appsDir).filter(i => i.startsWith('mixmlaal-')).indexOf(item)
    };
  });

const nginxConfig = `server {
    listen 80;
    server_name laal.top www.laal.top;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # 默认位置 - 前端主站
    location / {
        proxy_pass http://mixmlaal-frontend-vue:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 服务
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://mixmlaal-api-node:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

${modules.map(m => `    # ${m.name} (${m.tech})
    location ${m.route}/ {
        proxy_pass http://${m.original}:${m.port}/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }`).join('\n')}

    # 健康检查
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
`;

const outputPath = path.join(__dirname, '../mixmlaal-conf-d/laal.top.auto.conf');
fs.writeFileSync(outputPath, nginxConfig);

console.log('✅ Nginx 配置文件已自动生成:', outputPath);
console.log('\n📋 检测到的模块:');
modules.forEach(m => {
  console.log(`   ${m.route}/ → ${m.original}:${m.port} (${m.tech})`);
});
