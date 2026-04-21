# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY src/ ./src/

# 创建locales目录
RUN mkdir -p locales

# 复制locales目录
COPY locales/ ./locales/

# 暴露端口
EXPOSE 3022

# 启动服务
CMD ["npm", "start"]