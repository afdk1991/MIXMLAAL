<template>
  <div class="performance-monitor">
    <div class="monitor-header">
      <h3>性能监控</h3>
      <div class="monitor-controls">
        <button @click="toggleMonitor" class="control-btn">
          {{ isMonitoring ? '停止监控' : '开始监控' }}
        </button>
        <button @click="clearData" class="control-btn">
          清空数据
        </button>
      </div>
    </div>
    
    <div class="monitor-content">
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-title">首屏加载时间</div>
          <div class="metric-value">{{ metrics.firstPaintTime }}ms</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">DOM内容加载</div>
          <div class="metric-value">{{ metrics.domContentLoadedTime }}ms</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">页面完全加载</div>
          <div class="metric-value">{{ metrics.loadTime }}ms</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">布局偏移</div>
          <div class="metric-value">{{ metrics.layoutShift }}</div>
        </div>
      </div>
      
      <div class="charts-section">
        <div class="chart-container">
          <h4>渲染性能趋势</h4>
          <canvas ref="renderChart"></canvas>
        </div>
        <div class="chart-container">
          <h4>内存使用情况</h4>
          <canvas ref="memoryChart"></canvas>
        </div>
      </div>
      
      <div class="details-section">
        <h4>详细性能数据</h4>
        <div class="performance-table">
          <table>
            <thead>
              <tr>
                <th>指标</th>
                <th>当前值</th>
                <th>平均值</th>
                <th>最佳值</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, key) in performanceData" :key="key">
                <td>{{ item.label }}</td>
                <td>{{ item.current }}</td>
                <td>{{ item.average }}</td>
                <td>{{ item.best }}</td>
                <td :class="['status', item.status]">{{ item.statusText }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { monitorLayoutPerformance } from '../utils/performance';

const isMonitoring = ref(false);
const renderChart = ref(null);
const memoryChart = ref(null);
const renderChartInstance = ref(null);
const memoryChartInstance = ref(null);
const observer = ref(null);

const metrics = ref({
  firstPaintTime: 0,
  domContentLoadedTime: 0,
  loadTime: 0,
  layoutShift: 0
});

const performanceData = ref({
  fps: {
    label: '帧率',
    current: '60 FPS',
    average: '60 FPS',
    best: '60 FPS',
    status: 'good',
    statusText: '良好'
  },
  cpu: {
    label: 'CPU使用率',
    current: '0%',
    average: '0%',
    best: '0%',
    status: 'good',
    statusText: '良好'
  },
  memory: {
    label: '内存使用',
    current: '0 MB',
    average: '0 MB',
    best: '0 MB',
    status: 'good',
    statusText: '良好'
  },
  layout: {
    label: '布局重排',
    current: '0 次/秒',
    average: '0 次/秒',
    best: '0 次/秒',
    status: 'good',
    statusText: '良好'
  },
  paint: {
    label: '重绘次数',
    current: '0 次/秒',
    average: '0 次/秒',
    best: '0 次/秒',
    status: 'good',
    statusText: '良好'
  }
});

const renderData = ref({
  labels: [],
  datasets: [{
    label: '布局时间(ms)',
    data: [],
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.1
  }, {
    label: '绘制时间(ms)',
    data: [],
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    tension: 0.1
  }]
});

const memoryData = ref({
  labels: [],
  datasets: [{
    label: '内存使用(MB)',
    data: [],
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    tension: 0.1
  }]
});

function toggleMonitor() {
  if (isMonitoring.value) {
    stopMonitoring();
  } else {
    startMonitoring();
  }
}

function startMonitoring() {
  isMonitoring.value = true;
  
  // 监控布局性能
  observer.value = monitorLayoutPerformance((entry) => {
    console.log('性能数据:', entry);
  });
  
  // 定期收集性能数据
  collectPerformanceData();
}

function stopMonitoring() {
  isMonitoring.value = false;
  
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
}

function collectPerformanceData() {
  if (!isMonitoring.value) return;
  
  // 收集性能数据
  if (performance) {
    const now = new Date().toLocaleTimeString();
    
    // 更新时间数据
    if (performance.timing) {
      metrics.value.firstPaintTime = performance.timing.firstPaint - performance.timing.navigationStart;
      metrics.value.domContentLoadedTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      metrics.value.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    
    // 更新内存数据
    if (performance.memory) {
      const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      performanceData.value.memory.current = `${memoryMB} MB`;
      
      memoryData.value.labels.push(now);
      memoryData.value.datasets[0].data.push(parseFloat(memoryMB));
      
      // 保持数据点在合理范围内
      if (memoryData.value.labels.length > 20) {
        memoryData.value.labels.shift();
        memoryData.value.datasets[0].data.shift();
      }
      
      if (memoryChartInstance.value) {
        memoryChartInstance.value.update();
      }
    }
  }
  
  // 继续收集
  setTimeout(collectPerformanceData, 1000);
}

function clearData() {
  // 重置数据
  metrics.value = {
    firstPaintTime: 0,
    domContentLoadedTime: 0,
    loadTime: 0,
    layoutShift: 0
  };
  
  renderData.value = {
    labels: [],
    datasets: [{
      label: '布局时间(ms)',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1
    }, {
      label: '绘制时间(ms)',
      data: [],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.1
    }]
  };
  
  memoryData.value = {
    labels: [],
    datasets: [{
      label: '内存使用(MB)',
      data: [],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.1
    }]
  };
  
  // 更新图表
  if (renderChartInstance.value) {
    renderChartInstance.value.update();
  }
  if (memoryChartInstance.value) {
    memoryChartInstance.value.update();
  }
}

function initCharts() {
  if (renderChart.value) {
    renderChartInstance.value = new Chart(renderChart.value, {
      type: 'line',
      data: renderData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  if (memoryChart.value) {
    memoryChartInstance.value = new Chart(memoryChart.value, {
      type: 'line',
      data: memoryData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

onMounted(() => {
  // 初始化图表
  initCharts();
  
  // 收集初始性能数据
  collectPerformanceData();
});

onUnmounted(() => {
  // 停止监控
  stopMonitoring();
  
  // 销毁图表
  if (renderChartInstance.value) {
    renderChartInstance.value.destroy();
  }
  if (memoryChartInstance.value) {
    memoryChartInstance.value.destroy();
  }
});
</script>

<style scoped>
.performance-monitor {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem 0;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.monitor-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.monitor-controls {
  display: flex;
  gap: 0.75rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.metric-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-container {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.chart-container h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.chart-container canvas {
  height: 200px;
}

.details-section {
  margin-top: 2rem;
}

.details-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.performance-table {
  overflow-x: auto;
}

.performance-table table {
  width: 100%;
  border-collapse: collapse;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.performance-table th,
.performance-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.performance-table th {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #4b5563;
}

.performance-table tr:hover {
  background-color: #f3f4f6;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.good {
  background-color: #d1fae5;
  color: #065f46;
}

.status.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>