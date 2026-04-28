#!/bin/bash

set -e

echo "========================================"
echo "  MIXMLAAL 一键部署脚本"
echo "  域名: laal.top"
echo "========================================"

DOMAIN=${1:-laal.top}
NGINX_CONF="./mixmlaal-conf-d/laal.top.conf"
DOCKER_COMPOSE="./docker-compose.yml"

echo ""
echo "📦 步骤 1: 生成 Nginx 路由配置..."

if command -v node &> /dev/null; then
    node ./mixmlaal-scripts/generate-routes.js
    NGINX_CONF="./mixmlaal-conf-d/laal.top.auto.conf"
    echo "✅ 自动路由配置已生成"
else
    echo "⚠️  Node.js 未安装，使用默认配置"
    echo "   如需自动路由，请先安装 Node.js"
fi

echo ""
echo "🔧 步骤 2: 创建网络..."
docker network create mixmlaal-network 2>/dev/null || echo "   网络已存在"

echo ""
echo "📥 步骤 3: 拉取基础镜像..."
docker pull nginx:alpine
docker pull mysql:8
docker pull redis:7-alpine

echo ""
echo "🚀 步骤 4: 构建并启动所有服务..."
docker-compose -f "$DOCKER_COMPOSE" up -d --build

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "🔍 检查服务状态..."
docker-compose -f "$DOCKER_COMPOSE" ps

echo ""
echo "========================================"
echo "  部署完成!"
echo "========================================"
echo ""
echo "📍 访问地址:"
echo "   主站:      http://$DOMAIN/"
echo "   API:       http://$DOMAIN/api/"
echo "   管理后台:  http://$DOMAIN/admin/"
echo "   司机端:    http://$DOMAIN/driver/"
echo "   商户端:    http://$DOMAIN/merchant/"
echo "   H5移动端:  http://$DOMAIN/h5/"
echo "   健康检查:  http://$DOMAIN/health"
echo ""
echo "📝 常用命令:"
echo "   查看日志:  docker-compose -f $DOCKER_COMPOSE logs -f"
echo "   停止服务:  docker-compose -f $DOCKER_COMPOSE down"
echo "   重启服务:  docker-compose -f $DOCKER_COMPOSE restart"
echo "   重新构建:  docker-compose -f $DOCKER_COMPOSE up -d --build"
echo ""
