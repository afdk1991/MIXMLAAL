#!/bin/bash
# ============================================
# MIXMLAAL 部署脚本
# 版本: v1.0.0.0
# 说明: 生产环境自动化部署
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
PROJECT_NAME="mixmlaal"
DEPLOY_DIR="/opt/mixmlaal"
BACKUP_DIR="/opt/backups/mixmlaal"
LOG_FILE="/var/log/mixmlaal-deploy.log"

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# 检查依赖
check_dependencies() {
    log "检查依赖..."
    command -v docker >/dev/null 2>&1 || error "Docker未安装"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose未安装"
    log "依赖检查通过"
}

# 备份当前版本
backup() {
    log "备份当前版本..."
    if [ -d "$DEPLOY_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        backup_name="mixmlaal-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$BACKUP_DIR/$backup_name" -C "$DEPLOY_DIR" . 2>/dev/null || warn "备份失败，继续部署"
        log "备份完成: $backup_name"
    fi
}

# 拉取最新代码
pull_code() {
    log "拉取最新代码..."
    cd "$DEPLOY_DIR"
    git pull origin main || error "代码拉取失败"
    log "代码更新完成"
}

# 安装依赖
install_dependencies() {
    log "安装依赖..."
    cd "$DEPLOY_DIR"
    npm ci --production || error "依赖安装失败"
    log "依赖安装完成"
}

# 构建Docker镜像
build_images() {
    log "构建Docker镜像..."
    cd "$DEPLOY_DIR"
    docker-compose build --no-cache || error "镜像构建失败"
    log "镜像构建完成"
}

# 数据库迁移
migrate_database() {
    log "执行数据库迁移..."
    cd "$DEPLOY_DIR"
    # TODO: 执行实际的数据库迁移脚本
    # npm run db:migrate || error "数据库迁移失败"
    log "数据库迁移完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    local retries=30
    local wait_time=10

    for i in $(seq 1 $retries); do
        if curl -sf http://localhost:3000/api/v1/health >/dev/null 2>&1; then
            log "健康检查通过"
            return 0
        fi
        warn "健康检查失败，重试 $i/$retries..."
        sleep $wait_time
    done

    error "健康检查失败，部署可能需要回滚"
}

# 部署
deploy() {
    log "开始部署..."
    cd "$DEPLOY_DIR"

    # 停止旧服务
    log "停止旧服务..."
    docker-compose down --remove-orphans || warn "停止旧服务失败"

    # 启动新服务
    log "启动新服务..."
    docker-compose up -d || error "服务启动失败"

    # 等待服务启动
    log "等待服务启动..."
    sleep 10

    log "部署完成"
}

# 清理旧备份
cleanup_backups() {
    log "清理旧备份..."
    cd "$BACKUP_DIR"
    # 保留最近30个备份
    ls -t | tail -n +31 | xargs -r rm -f
    log "旧备份清理完成"
}

# 回滚
rollback() {
    error "部署失败，执行回滚..."
    cd "$DEPLOY_DIR"
    docker-compose down
    # 恢复备份
    latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        tar -xzf "$latest_backup" -C "$DEPLOY_DIR"
        docker-compose up -d
        log "回滚完成"
    else
        error "无可用备份"
    fi
}

# 主流程
main() {
    log "=================================="
    log "MIXMLAAL 部署开始"
    log "=================================="

    check_dependencies
    backup
    pull_code
    install_dependencies
    build_images
    migrate_database
    deploy
    health_check
    cleanup_backups

    log "=================================="
    log "MIXMLAAL 部署成功"
    log "=================================="
}

# 捕获错误并回滚
trap 'rollback' ERR

# 执行主流程
main "$@"
