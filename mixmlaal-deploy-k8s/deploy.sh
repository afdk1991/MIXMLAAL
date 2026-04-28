#!/bin/bash

# ============================================
# MixMLAAL Platform Kubernetes Deployment Script
# 版本: v1.0.0.0
# 说明: 用于部署整个MixMLAAL平台到Kubernetes集群
# ============================================

# 配置变量
NAMESPACE="mixmlaal"
CONTEXT="minikube"
TIMEOUT=300

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== MixMLAAL Platform Kubernetes Deployment ===${NC}"

# 检查kubectl是否安装
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# 检查Kubernetes集群连接
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${GREEN}Connected to Kubernetes cluster${NC}"

# 创建命名空间
echo -e "${YELLOW}Creating namespace ${NAMESPACE}...${NC}"
kubectl apply -f namespace.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create namespace${NC}"
    exit 1
fi

# 部署配置映射
echo -e "${YELLOW}Deploying configmap...${NC}"
kubectl apply -f configmap.yaml
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to deploy configmap${NC}"
    exit 1
fi

# 部署数据库服务
echo -e "${YELLOW}Deploying database services...${NC}"
# MySQL
echo -e "${YELLOW}Deploying MySQL...${NC}"
kubectl apply -f mysql-deployment.yaml
echo -e "${YELLOW}Deploying MySQL service...${NC}"
kubectl apply -f mysql-service.yaml

# 部署缓存服务
echo -e "${YELLOW}Deploying cache services...${NC}"
# Redis
echo -e "${YELLOW}Deploying Redis...${NC}"
kubectl apply -f redis-deployment.yaml
echo -e "${YELLOW}Deploying Redis service...${NC}"
kubectl apply -f redis-service.yaml

# 部署消息队列服务
echo -e "${YELLOW}Deploying message queue services...${NC}"
# ZooKeeper
echo -e "${YELLOW}Deploying ZooKeeper...${NC}"
kubectl apply -f zookeeper-deployment.yaml
echo -e "${YELLOW}Deploying ZooKeeper service...${NC}"
kubectl apply -f zookeeper-service.yaml

# Kafka
echo -e "${YELLOW}Deploying Kafka...${NC}"
kubectl apply -f kafka-deployment.yaml
echo -e "${YELLOW}Deploying Kafka service...${NC}"
kubectl apply -f kafka-service.yaml

# 部署服务发现和配置中心
echo -e "${YELLOW}Deploying service discovery and config center...${NC}"
# Consul
echo -e "${YELLOW}Deploying Consul...${NC}"
kubectl apply -f consul-deployment.yaml
echo -e "${YELLOW}Deploying Consul service...${NC}"
kubectl apply -f consul-service.yaml

# Nacos
echo -e "${YELLOW}Deploying Nacos...${NC}"
kubectl apply -f nacos-deployment.yaml
echo -e "${YELLOW}Deploying Nacos service...${NC}"
kubectl apply -f nacos-service.yaml

# 部署服务网格
echo -e "${YELLOW}Deploying service mesh...${NC}"
# Istio Pilot
echo -e "${YELLOW}Deploying Istio Pilot...${NC}"
kubectl apply -f istio-pilot-deployment.yaml
echo -e "${YELLOW}Deploying Istio Pilot service...${NC}"
kubectl apply -f istio-pilot-service.yaml

# Istio Proxy
echo -e "${YELLOW}Deploying Istio Proxy...${NC}"
kubectl apply -f istio-proxy-deployment.yaml
echo -e "${YELLOW}Deploying Istio Proxy service...${NC}"
kubectl apply -f istio-proxy-service.yaml

# 部署核心微服务
echo -e "${YELLOW}Deploying core microservices...${NC}"

# User service
echo -e "${YELLOW}Deploying User service...${NC}"
kubectl apply -f user-service-deployment.yaml
echo -e "${YELLOW}Deploying User service...${NC}"
kubectl apply -f user-service-service.yaml

# Ride service
echo -e "${YELLOW}Deploying Ride service...${NC}"
kubectl apply -f ride-service-deployment.yaml
echo -e "${YELLOW}Deploying Ride service...${NC}"
kubectl apply -f ride-service-service.yaml

# Ecommerce service
echo -e "${YELLOW}Deploying Ecommerce service...${NC}"
kubectl apply -f ecommerce-service-deployment.yaml
echo -e "${YELLOW}Deploying Ecommerce service...${NC}"
kubectl apply -f ecommerce-service-service.yaml

# Payment service
echo -e "${YELLOW}Deploying Payment service...${NC}"
kubectl apply -f payment-service-deployment.yaml
echo -e "${YELLOW}Deploying Payment service...${NC}"
kubectl apply -f payment-service-service.yaml

# Order service
echo -e "${YELLOW}Deploying Order service...${NC}"
kubectl apply -f order-service-deployment.yaml
echo -e "${YELLOW}Deploying Order service...${NC}"
kubectl apply -f order-service-service.yaml

# Social service
echo -e "${YELLOW}Deploying Social service...${NC}"
kubectl apply -f social-service-deployment.yaml
echo -e "${YELLOW}Deploying Social service...${NC}"
kubectl apply -f social-service-service.yaml

# Portal service
echo -e "${YELLOW}Deploying Portal service...${NC}"
kubectl apply -f portal-service-deployment.yaml
echo -e "${YELLOW}Deploying Portal service...${NC}"
kubectl apply -f portal-service-service.yaml

# Common service
echo -e "${YELLOW}Deploying Common service...${NC}"
kubectl apply -f common-service-deployment.yaml
echo -e "${YELLOW}Deploying Common service...${NC}"
kubectl apply -f common-service-service.yaml

# Food service
echo -e "${YELLOW}Deploying Food service...${NC}"
kubectl apply -f food-service-deployment.yaml
echo -e "${YELLOW}Deploying Food service...${NC}"
kubectl apply -f food-service-service.yaml

# Errand service
echo -e "${YELLOW}Deploying Errand service...${NC}"
kubectl apply -f errand-service-deployment.yaml
echo -e "${YELLOW}Deploying Errand service...${NC}"
kubectl apply -f errand-service-service.yaml

# Transaction service
echo -e "${YELLOW}Deploying Transaction service...${NC}"
kubectl apply -f transaction-service-deployment.yaml
echo -e "${YELLOW}Deploying Transaction service...${NC}"
kubectl apply -f transaction-service-service.yaml

# 部署区块链服务
echo -e "${YELLOW}Deploying Blockchain service...${NC}"
kubectl apply -f blockchain-service-deployment.yaml
echo -e "${YELLOW}Deploying Blockchain service...${NC}"
kubectl apply -f blockchain-service-service.yaml

# 部署5G服务
echo -e "${YELLOW}Deploying 5G service...${NC}"
kubectl apply -f 5g-service-deployment.yaml
echo -e "${YELLOW}Deploying 5G service...${NC}"
kubectl apply -f 5g-service-service.yaml

# 部署边缘计算服务
echo -e "${YELLOW}Deploying Edge service...${NC}"
kubectl apply -f edge-service-deployment.yaml
echo -e "${YELLOW}Deploying Edge service...${NC}"
kubectl apply -f edge-service-service.yaml

# 部署缓存服务
echo -e "${YELLOW}Deploying Cache service...${NC}"
kubectl apply -f cache-service-deployment.yaml
echo -e "${YELLOW}Deploying Cache service...${NC}"
kubectl apply -f cache-service-service.yaml

# 部署智能交通服务
echo -e "${YELLOW}Deploying Smart Traffic service...${NC}"
kubectl apply -f smart-traffic-deployment.yaml
echo -e "${YELLOW}Deploying Smart Traffic service...${NC}"
kubectl apply -f smart-traffic-service.yaml

# 部署供应链服务
echo -e "${YELLOW}Deploying Supply Chain service...${NC}"
kubectl apply -f supply-chain-deployment.yaml
echo -e "${YELLOW}Deploying Supply Chain service...${NC}"
kubectl apply -f supply-chain-service.yaml

# 部署运营平台
echo -e "${YELLOW}Deploying Operation Platform...${NC}"
kubectl apply -f operation-platform-deployment.yaml
echo -e "${YELLOW}Deploying Operation Platform service...${NC}"
kubectl apply -f operation-platform-service.yaml

# 部署客户服务系统
echo -e "${YELLOW}Deploying Customer Service system...${NC}"
kubectl apply -f customer-service-deployment.yaml
echo -e "${YELLOW}Deploying Customer Service system service...${NC}"
kubectl apply -f customer-service-service.yaml

# 部署安全服务
echo -e "${YELLOW}Deploying Security service...${NC}"
kubectl apply -f security-service-deployment.yaml
kubectl apply -f security-service-service.yaml

# 部署开发者平台
echo -e "${YELLOW}Deploying Developer Platform...${NC}"
kubectl apply -f developer-platform-deployment.yaml
echo -e "${YELLOW}Deploying Developer Platform service...${NC}"
kubectl apply -f developer-platform-service.yaml

# 部署国际化服务
echo -e "${YELLOW}Deploying i18n service...${NC}"
kubectl apply -f i18n-service-deployment.yaml
echo -e "${YELLOW}Deploying i18n service...${NC}"
kubectl apply -f i18n-service-service.yaml

# 部署AI服务
echo -e "${YELLOW}Deploying AI service...${NC}"
kubectl apply -f ai-service-deployment.yaml
echo -e "${YELLOW}Deploying AI service...${NC}"
kubectl apply -f ai-service-service.yaml

# 部署API网关
echo -e "${YELLOW}Deploying API Gateway...${NC}"
kubectl apply -f api-gateway-deployment.yaml
echo -e "${YELLOW}Deploying API Gateway service...${NC}"
kubectl apply -f api-gateway-service.yaml

# 部署监控服务
echo -e "${YELLOW}Deploying monitoring services...${NC}"

# Prometheus
echo -e "${YELLOW}Deploying Prometheus...${NC}"
kubectl apply -f prometheus-deployment.yaml
echo -e "${YELLOW}Deploying Prometheus service...${NC}"
kubectl apply -f prometheus-service.yaml

# Grafana
echo -e "${YELLOW}Deploying Grafana...${NC}"
kubectl apply -f grafana-deployment.yaml
echo -e "${YELLOW}Deploying Grafana service...${NC}"
kubectl apply -f grafana-service.yaml

# 等待所有服务就绪
echo -e "${YELLOW}Waiting for all services to be ready...${NC}"
sleep 10

# 检查部署状态
echo -e "${YELLOW}Checking deployment status...${NC}"
kubectl get pods -n $NAMESPACE

# 检查服务状态
echo -e "${YELLOW}Checking service status...${NC}"
kubectl get services -n $NAMESPACE

# 检查API网关外部IP
echo -e "${YELLOW}Checking API Gateway external IP...${NC}"
sleep 5
kubectl get service api-gateway -n $NAMESPACE

echo -e "${GREEN}=== Deployment completed successfully! ===${NC}"
echo -e "${GREEN}MixMLAAL Platform is now running in Kubernetes cluster${NC}"
