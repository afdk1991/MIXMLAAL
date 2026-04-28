#!/bin/bash

# ============================================
# MIXMLAAL OpenCloudOS 8 部署脚本
# 适配服务器: 110.42.133.52 (公网) / 10.0.4.12 (内网)
# 资源配置: 4核CPU / 4GB内存 / 70GB系统盘 / 600GB流量包
# 版本: v1.0.0.0
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务器配置
SERVER_IP="110.42.133.52"
SERVER_INTERNAL_IP="10.0.4.12"
SERVER_NAME="OpenCloudOS 8"
DOMAIN=${1:-laal.top}
DOCKER_COMPOSE_FILE="docker-compose.opencloudos.yml"
ENV_FILE=".env.opencloudos"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MIXMLAAL OpenCloudOS 8 部署脚本${NC}"
echo -e "${BLUE}  服务器: ${SERVER_IP}${NC}"
echo -e "${BLUE}  域名: ${DOMAIN}${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查是否为 OpenCloudOS/CentOS/RHEL
check_os() {
    if [ -f /etc/opencloudos-release ]; then
        echo -e "${GREEN}✓ 检测到 OpenCloudOS${NC}"
        OS="opencloudos"
    elif [ -f /etc/centos-release ]; then
        echo -e "${GREEN}✓ 检测到 CentOS${NC}"
        OS="centos"
    elif [ -f /etc/redhat-release ]; then
        echo -e "${GREEN}✓ 检测到 Red Hat Enterprise Linux${NC}"
        OS="rhel"
    elif [ -f /etc/os-release ]; then
        . /etc/os-release
        if [ "$ID" == "ubuntu" ]; then
            echo -e "${GREEN}✓ 检测到 Ubuntu${NC}"
            OS="ubuntu"
        else
            echo -e "${YELLOW}⚠ 未识别的操作系统: $NAME${NC}"
            OS="unknown"
        fi
    else
        echo -e "${RED}✗ 无法检测操作系统${NC}"
        OS="unknown"
    fi
}

# 检查 Docker 和 Docker Compose
check_docker() {
    echo ""
    echo -e "${BLUE}📦 检查 Docker 环境...${NC}"

    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        echo -e "${GREEN}✓ Docker 已安装: ${DOCKER_VERSION}${NC}"
    else
        echo -e "${RED}✗ Docker 未安装${NC}"
        echo -e "${YELLOW}请先安装 Docker:${NC}"
        echo "curl -fsSL https://get.docker.com | sh"
        exit 1
    fi

    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        echo -e "${GREEN}✓ Docker Compose 已安装: ${COMPOSE_VERSION}${NC}"
    elif docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version)
        echo -e "${GREEN}✓ Docker Compose (v2) 已安装: ${COMPOSE_VERSION}${NC}"
        COMPOSE_CMD="docker compose"
    else
        echo -e "${RED}✗ Docker Compose 未安装${NC}"
        exit 1
    fi
}

# 检查系统资源
check_resources() {
    echo ""
    echo -e "${BLUE}🖥️  检查系统资源...${NC}"

    CPU_CORES=$(nproc 2>/dev/null || echo 4)
    MEMORY_TOTAL=$(free -m | awk '/^Mem:/{print $2}' | head -1)
    DISK_AVAILABLE=$(df -h / | awk 'NR==2 {print $4}')

    echo -e "  CPU 核心数: ${CPU_CORES}"
    echo -e "  内存总量: ${MEMORY_TOTAL}MB"
    echo -e "  可用磁盘: ${DISK_AVAILABLE}"

    if [ "$MEMORY_TOTAL" -lt 3500 ]; then
        echo -e "${YELLOW}⚠️  警告: 内存低于推荐值 (4GB)${NC}"
    fi
}

# 初始化目录结构
init_directories() {
    echo ""
    echo -e "${BLUE}📁 初始化目录结构...${NC}"

    mkdir -p mixmlaal-logs
    mkdir -p mixmlaal-conf-d
    mkdir -p ../mixmlaal-apps/mixmlaal-frontend-vue/dist

    echo -e "${GREEN}✓ 目录结构已创建${NC}"
}

# 加载环境变量
load_env() {
    echo ""
    echo -e "${BLUE}⚙️  加载环境配置...${NC}"

    if [ -f "${ENV_FILE}" ]; then
        set -a
        source "${ENV_FILE}"
        set +a
        echo -e "${GREEN}✓ 环境变量已加载 (${ENV_FILE})${NC}"
    else
        echo -e "${YELLOW}⚠️  环境配置文件不存在，使用默认值${NC}"
    fi
}

# 创建网络
create_network() {
    echo ""
    echo -e "${BLUE}🌐 创建 Docker 网络...${NC}"

    docker network create mixmlaal-network 2>/dev/null || echo -e "${GREEN}✓ 网络已存在，跳过创建${NC}"
}

# 拉取基础镜像
pull_images() {
    echo ""
    echo -e "${BLUE}📥 拉取基础镜像...${NC}"

    docker pull nginx:alpine
    docker pull mysql:8
    docker pull redis:7-alpine
    docker pull prom/prometheus:v2.45.0

    echo -e "${GREEN}✓ 基础镜像已更新${NC}"
}

# 构建前端
build_frontend() {
    echo ""
    echo -e "${BLUE}🏗️  构建前端应用...${NC}"

    cd ../mixmlaal-apps/mixmlaal-frontend-vue

    if [ -d "node_modules" ]; then
        echo -e "  跳过 npm install（已存在 node_modules）"
    else
        echo -e "  执行 npm install..."
        npm install
    fi

    echo -e "  执行 npm run build..."
    npm run build

    if [ -d "dist" ]; then
        echo -e "${GREEN}✓ 前端构建完成${NC}"
    else
        echo -e "${RED}✗ 前端构建失败${NC}"
        exit 1
    fi

    cd ../../mixmlaal-deploy-nginx
}

# 启动服务
start_services() {
    echo ""
    echo -e "${BLUE}🚀 启动服务...${NC}"

    if [ -z "$COMPOSE_CMD" ]; then
        COMPOSE_CMD="docker-compose"
    fi

    $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" up -d

    echo -e "${GREEN}✓ 服务已启动${NC}"
}

# 等待服务健康
wait_for_health() {
    echo ""
    echo -e "${BLUE}⏳ 等待服务健康检查...${NC}"

    MAX_WAIT=120
    COUNTER=0

    while [ $COUNTER -lt $MAX_WAIT ]; do
        MYSQL_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mixmlaal-mysql 2>/dev/null || echo "none")
        REDIS_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mixmlaal-redis 2>/dev/null || echo "none")
        API_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' mixmlaal-api-node 2>/dev/null || echo "none")

        echo -e "  MySQL: ${MYSQL_HEALTH} | Redis: ${REDIS_HEALTH} | API: ${API_HEALTH}"

        if [ "$MYSQL_HEALTH" == "healthy" ] && [ "$REDIS_HEALTH" == "healthy" ] && [ "$API_HEALTH" == "healthy" ]; then
            echo -e "${GREEN}✓ 所有服务健康${NC}"
            return 0
        fi

        sleep 5
        COUNTER=$((COUNTER + 5))
    done

    echo -e "${YELLOW}⚠️  等待超时，部分服务可能未就绪${NC}"
}

# 检查服务状态
check_status() {
    echo ""
    echo -e "${BLUE}🔍 检查服务状态...${NC}"

    if [ -z "$COMPOSE_CMD" ]; then
        COMPOSE_CMD="docker-compose"
    fi

    $COMPOSE_CMD -f "$DOCKER_COMPOSE_FILE" ps

    echo ""
    echo -e "${BLUE}📊 容器资源使用情况:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# 显示访问信息
show_access_info() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  部署完成!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${GREEN}📍 访问地址:${NC}"
    echo -e "   主站:      http://${SERVER_IP}/"
    echo -e "   API:       http://${SERVER_IP}/api/"
    echo -e "   管理后台:  http://${SERVER_IP}/admin/"
    echo -e "   健康检查:  http://${SERVER_IP}/health"
    echo -e "   Prometheus: http://${SERVER_IP}:9090/"
    echo ""
    echo -e "${GREEN}📝 常用命令:${NC}"
    echo -e "   查看日志:   $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE logs -f"
    echo -e "   停止服务:   $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE down"
    echo -e "   重启服务:   $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE restart"
    echo -e "   重新构建:   $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE up -d --build"
    echo ""
    echo -e "${GREEN}🔧 服务器信息:${NC}"
    echo -e "   公网IP:    ${SERVER_IP}"
    echo -e "   内网IP:    ${SERVER_INTERNAL_IP}"
    echo -e "   系统:      ${SERVER_NAME}"
    echo -e "   流量重置:  2026-05-13 20:21:36"
    echo ""
}

# 主流程
main() {
    check_os
    check_docker
    check_resources
    init_directories
    load_env
    create_network
    pull_images
    build_frontend
    start_services
    wait_for_health
    check_status
    show_access_info
}

# 执行主流程
main "$@"
