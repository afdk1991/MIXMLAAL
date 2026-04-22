#!/bin/bash

echo "Setting up Kibana index patterns and dashboards..."

KIBANA_HOST="http://localhost:5601"
ELASTICSEARCH_HOST="http://localhost:9200"

wait_for_kibana() {
  echo "Waiting for Kibana to be ready..."
  until curl -s -o /dev/null -w "%{http_code}" "$KIBANA_HOST/api/status" | grep -q "200"; do
    sleep 5
    echo "Kibana is not ready yet, waiting..."
  done
  echo "Kibana is ready!"
}

wait_for_elasticsearch() {
  echo "Waiting for Elasticsearch to be ready..."
  until curl -s -o /dev/null -w "%{http_code}" "$ELASTICSEARCH_HOST" | grep -q "200"; do
    sleep 5
    echo "Elasticsearch is not ready yet, waiting..."
  done
  echo "Elasticsearch is ready!"
}

setup_index_patterns() {
  echo "Creating index patterns..."

  curl -X POST "$KIBANA_HOST/api/saved_objects/index-pattern" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "mixmlaal-*-*",
        "timeFieldName": "@timestamp"
      }
    }'

  curl -X POST "$KIBANA_HOST/api/saved_objects/index-pattern" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "mixmlaal-business-*",
        "timeFieldName": "@timestamp"
      }
    }'

  curl -X POST "$KIBANA_HOST/api/saved_objects/index-pattern" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "mixmlaal-gateway-*",
        "timeFieldName": "@timestamp"
      }
    }'

  curl -X POST "$KIBANA_HOST/api/saved_objects/index-pattern" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "mixmlaal-errors-*",
        "timeFieldName": "@timestamp"
      }
    }'

  echo "Index patterns created!"
}

setup_dashboards() {
  echo "Creating dashboards..."

  curl -X POST "$KIBANA_HOST/api/saved_objects/dashboard" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "MixMLAAL 系统概览",
        "description": "系统整体运行状态仪表板",
        "panelsJSON": "[{\"version":"7.17.13","type":"visualization","gridData":{"x":0,"y":0,"w":24,"h":12,"i":"1"},"panelIndex":"1","embeddableConfig":{},"title":"服务状态"}]",
        "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"hidePanelTitles\":false}",
        "version": 1
      }
    }'

  curl -X POST "$KIBANA_HOST/api/saved_objects/dashboard" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "MixMLAAL 错误分析",
        "description": "系统错误和异常监控仪表板",
        "panelsJSON": "[{\"version":"7.17.13\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":0,\"w\":24,\"h\":12,\"i\":\"1\"},\"panelIndex\":\"1\",\"embeddableConfig\":{},\"title\":\"错误趋势\"}]",
        "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"hidePanelTitles\":false}",
        "version": 1
      }
    }'

  curl -X POST "$KIBANA_HOST/api/saved_objects/dashboard" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "MixMLAAL 业务监控",
        "description": "业务指标监控仪表板",
        "panelsJSON": "[{\"version\":\"7.17.13\",\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":0,\"w\":24,\"h\":12,\"i\":\"1\"},\"panelIndex\":\"1\",\"embeddableConfig\":{},\"title\":\"业务指标\"}]",
        "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"hidePanelTitles\":false}",
        "version": 1
      }
    }'

  echo "Dashboards created!"
}

setup_filters() {
  echo "Creating saved filters..."

  curl -X POST "$KIBANA_HOST/api/saved_objects/filter" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
      "attributes": {
        "title": "Production Environment Filter",
        "query": "{\"match\":{\"environment\":\"production\"}}",
        "disabled": false
      }
    }'

  echo "Filters created!"
}

wait_for_elasticsearch
wait_for_kibana
setup_index_patterns
setup_dashboards
setup_filters

echo "Kibana setup completed!"