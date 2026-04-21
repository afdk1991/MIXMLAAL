# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-base \
    git

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY src/ ./src/

# 创建模型目录
RUN mkdir -p models

# 复制模型文件
COPY models/ ./models/

# 暴露端口
EXPOSE 3023

# 启动服务
CMD ["npm", "start"]