# ============================================
# MIXMLAAL 后端API服务 Dockerfile
# 版本: v1.0.0.0
# 说明: 多阶段构建，优化镜像体积和安全性
# 使用 PM2 Cluster 模式保护源代码
# ============================================

# 依赖安装阶段
FROM node:18-alpine AS dependencies

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# PM2 全局安装
RUN npm install -g pm2 && pm2 install pm2-log-rotate

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /usr/local/lib/node_modules/pm2 /usr/local/lib/node_modules/pm2
COPY --from=dependencies /usr/local/bin/pm2 /usr/local/bin/pm2

# 复制源代码
COPY . .

# 运行前端构建
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装必要工具
RUN apk add --no-cache curl ca-certificates dumb-init tzdata

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制生产依赖和 PM2
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /usr/local/lib/node_modules/pm2 /usr/local/lib/node_modules/pm2
COPY --from=dependencies /usr/local/bin/pm2 /usr/local/bin/pm2

# 复制 PM2 配置文件
COPY ecosystem.config.js ./

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制应用代码
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs public ./public
COPY --chown=nodejs:nodejs package.json ./

# 创建日志目录
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

# 使用 dumb-init 处理信号
ENTRYPOINT ["dumb-init", "--"]

# 使用 PM2 启动应用（Cluster 模式）
CMD ["pm2", "start", "ecosystem.config.js", "--env", "production"]
