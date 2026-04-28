#!/bin/bash

# ============================================
# OpenCloudOS8-Docker26 镜像构建脚本
# 镜像名称: OpenCloudOS8-Docker26
# 镜像类型: Docker基础镜像
# 操作系统: OpenCloudOS 8
# 适用服务: MIXMLAAL 全栈应用
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 镜像配置
IMAGE_NAME="opencloudos8-docker26"
IMAGE_TAG="v1.0.0"
REGISTRY=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  OpenCloudOS8-Docker26 镜像构建脚本${NC}"
echo -e "${BLUE}  操作系统: OpenCloudOS 8${NC}"
echo -e "${BLUE}  镜像类型: Docker基础镜像${NC}"
echo -e "${BLUE}========================================${NC}"

# 构建API服务镜像
build_api() {
    echo ""
    echo -e "${BLUE}🏗️  构建 API 服务镜像...${NC}"
    
    cd ../mixmlaal-apps/mixmlaal-api-node
    
    echo -e "  构建镜像: ${IMAGE_NAME}-api"
    docker build -f Dockerfile.opencloudos -t ${IMAGE_NAME}-api:${IMAGE_TAG} .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ API 服务镜像构建成功${NC}"
    else
        echo -e "${RED}✗ API 服务镜像构建失败${NC}"
        exit 1
    fi
    
    cd ../../mixmlaal-deploy-nginx
}

# 构建前端服务镜像
build_frontend() {
    echo ""
    echo -e "${BLUE}🏗️  构建前端主站镜像...${NC}"
    
    cd ../mixmlaal-apps/mixmlaal-frontend-vue
    
    echo -e "  构建镜像: ${IMAGE_NAME}-frontend"
    docker build -f Dockerfile.opencloudos -t ${IMAGE_NAME}-frontend:${IMAGE_TAG} .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 前端主站镜像构建成功${NC}"
    else
        echo -e "${RED}✗ 前端主站镜像构建失败${NC}"
        exit 1
    fi
    
    cd ../../mixmlaal-deploy-nginx
}

# 构建管理后台镜像
build_admin() {
    echo ""
    echo -e "${BLUE}🏗️  构建管理后台镜像...${NC}"
    
    cd ../mixmlaal-apps/mixmlaal-admin-vue
    
    echo -e "  构建镜像: ${IMAGE_NAME}-admin"
    docker build -f Dockerfile.opencloudos -t ${IMAGE_NAME}-admin:${IMAGE_TAG} .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 管理后台镜像构建成功${NC}"
    else
        echo -e "${RED}✗ 管理后台镜像构建失败${NC}"
        exit 1
    fi
    
    cd ../../mixmlaal-deploy-nginx
}

# 推送镜像到仓库
push_images() {
    if [ -n "$REGISTRY" ]; then
        echo ""
        echo -e "${BLUE}📤 推送镜像到仓库...${NC}"
        
        docker tag ${IMAGE_NAME}-api:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}-api:${IMAGE_TAG}
        docker tag ${IMAGE_NAME}-frontend:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}-frontend:${IMAGE_TAG}
        docker tag ${IMAGE_NAME}-admin:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}-admin:${IMAGE_TAG}
        
        docker push ${REGISTRY}/${IMAGE_NAME}-api:${IMAGE_TAG}
        docker push ${REGISTRY}/${IMAGE_NAME}-frontend:${IMAGE_TAG}
        docker push ${REGISTRY}/${IMAGE_NAME}-admin:${IMAGE_TAG}
        
        echo -e "${GREEN}✓ 镜像推送成功${NC}"
    fi
}

# 显示镜像列表
show_images() {
    echo ""
    echo -e "${BLUE}📊 构建完成的镜像列表:${NC}"
    docker images | grep "${IMAGE_NAME}"
}

# 主流程
main() {
    echo -e "${YELLOW}⚠️  注意: 请确保已安装 Docker 并且有足够的磁盘空间${NC}"
    echo -e "${YELLOW}⚠️  构建过程可能需要较长时间，请耐心等待${NC}"
    echo ""
    
    build_api
    build_frontend
    build_admin
    push_images
    show_images
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}  镜像构建完成!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${GREEN}📝 镜像信息:${NC}"
    echo -e "   镜像名称: ${IMAGE_NAME}"
    echo -e "   镜像版本: ${IMAGE_TAG}"
    echo -e "   操作系统: OpenCloudOS 8"
    echo ""
    echo -e "${GREEN}🚀 部署命令:${NC}"
    echo -e "   docker-compose -f docker-compose.opencloudos.yml up -d"
}

# 执行主流程
main "$@"
