<template>
  <div class="ai-container">
    <div class="ai-header">
      <h2 class="text-2xl font-bold">AI功能管理</h2>
      <p class="text-gray-600">管理AI模型和功能配置</p>
    </div>
    
    <div class="ai-stats">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 text-blue-600">
          <i class="fa fa-robot text-2xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.models }}</div>
          <div class="stat-label">AI模型数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green-100 text-green-600">
          <i class="fa fa-brain text-2xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.features }}</div>
          <div class="stat-label">AI功能数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-purple-100 text-purple-600">
          <i class="fa fa-users text-2xl"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.usage }}</div>
          <div class="stat-label">今日使用量</div>
        </div>
      </div>
    </div>
    
    <div class="ai-models">
      <div class="section-header">
        <h3 class="text-xl font-semibold">AI模型管理</h3>
        <button class="add-btn" @click="showAddModelModal = true">
          <i class="fa fa-plus mr-2"></i>添加模型
        </button>
      </div>
      
      <div class="model-list">
        <table class="model-table">
          <thead>
            <tr>
              <th>模型ID</th>
              <th>模型名称</th>
              <th>类型</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="model in models" :key="model.id">
              <td>{{ model.id }}</td>
              <td>{{ model.name }}</td>
              <td>{{ model.type }}</td>
              <td>
                <span :class="['status-badge', model.status === 'active' ? 'active' : 'inactive']">
                  {{ model.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ model.createdAt }}</td>
              <td>
                <button class="action-btn edit" @click="editModel(model)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="action-btn delete" @click="deleteModel(model.id)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="ai-features">
      <div class="section-header">
        <h3 class="text-xl font-semibold">AI功能管理</h3>
        <button class="add-btn" @click="showAddFeatureModal = true">
          <i class="fa fa-plus mr-2"></i>添加功能
        </button>
      </div>
      
      <div class="feature-list">
        <table class="feature-table">
          <thead>
            <tr>
              <th>功能ID</th>
              <th>功能名称</th>
              <th>关联模型</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feature in features" :key="feature.id">
              <td>{{ feature.id }}</td>
              <td>{{ feature.name }}</td>
              <td>{{ feature.modelName }}</td>
              <td>
                <span :class="['status-badge', feature.status === 'active' ? 'active' : 'inactive']">
                  {{ feature.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ feature.createdAt }}</td>
              <td>
                <button class="action-btn edit" @click="editFeature(feature)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="action-btn delete" @click="deleteFeature(feature.id)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 添加模型模态框 -->
    <div v-if="showAddModelModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">添加AI模型</h3>
          <button class="modal-close" @click="showAddModelModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addModel">
            <div class="form-group">
              <label for="modelName">模型名称</label>
              <input type="text" id="modelName" v-model="newModel.name" required>
            </div>
            <div class="form-group">
              <label for="modelType">模型类型</label>
              <select id="modelType" v-model="newModel.type" required>
                <option value="text">文本生成</option>
                <option value="image">图像生成</option>
                <option value="voice">语音处理</option>
                <option value="multi">多模态</option>
              </select>
            </div>
            <div class="form-group">
              <label for="modelStatus">状态</label>
              <select id="modelStatus" v-model="newModel.status" required>
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="showAddModelModal = false">取消</button>
              <button type="submit" class="btn-submit">添加</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 添加功能模态框 -->
    <div v-if="showAddFeatureModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">添加AI功能</h3>
          <button class="modal-close" @click="showAddFeatureModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addFeature">
            <div class="form-group">
              <label for="featureName">功能名称</label>
              <input type="text" id="featureName" v-model="newFeature.name" required>
            </div>
            <div class="form-group">
              <label for="featureModel">关联模型</label>
              <select id="featureModel" v-model="newFeature.modelId" required>
                <option v-for="model in models" :key="model.id" :value="model.id">
                  {{ model.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="featureStatus">状态</label>
              <select id="featureStatus" v-model="newFeature.status" required>
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="showAddFeatureModal = false">取消</button>
              <button type="submit" class="btn-submit">添加</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 统计数据
const stats = ref({
  models: 5,
  features: 12,
  usage: 128
});

// AI模型列表
const models = ref([
  { id: 1, name: 'GPT-4', type: '文本生成', status: 'active', createdAt: '2024-01-01' },
  { id: 2, name: 'DALL-E 3', type: '图像生成', status: 'active', createdAt: '2024-01-02' },
  { id: 3, name: 'Whisper', type: '语音处理', status: 'active', createdAt: '2024-01-03' },
  { id: 4, name: 'Claude 3', type: '文本生成', status: 'inactive', createdAt: '2024-01-04' },
  { id: 5, name: 'Midjourney', type: '图像生成', status: 'active', createdAt: '2024-01-05' }
]);

// AI功能列表
const features = ref([
  { id: 1, name: '智能客服', modelName: 'GPT-4', status: 'active', createdAt: '2024-01-01' },
  { id: 2, name: '图像生成', modelName: 'DALL-E 3', status: 'active', createdAt: '2024-01-02' },
  { id: 3, name: '语音转文字', modelName: 'Whisper', status: 'active', createdAt: '2024-01-03' },
  { id: 4, name: '文本摘要', modelName: 'GPT-4', status: 'active', createdAt: '2024-01-04' },
  { id: 5, name: '产品推荐', modelName: 'GPT-4', status: 'inactive', createdAt: '2024-01-05' },
  { id: 6, name: '内容生成', modelName: 'Claude 3', status: 'inactive', createdAt: '2024-01-06' }
]);

// 模态框状态
const showAddModelModal = ref(false);
const showAddFeatureModal = ref(false);

// 新模型数据
const newModel = ref({
  name: '',
  type: 'text',
  status: 'active'
});

// 新功能数据
const newFeature = ref({
  name: '',
  modelId: '',
  status: 'active'
});

// 添加模型
const addModel = () => {
  const model = {
    id: models.value.length + 1,
    name: newModel.value.name,
    type: newModel.value.type,
    status: newModel.value.status,
    createdAt: new Date().toISOString().split('T')[0]
  };
  models.value.push(model);
  stats.value.models++;
  showAddModelModal.value = false;
  // 重置表单
  newModel.value = {
    name: '',
    type: 'text',
    status: 'active'
  };
};

// 添加功能
const addFeature = () => {
  const model = models.value.find(m => m.id === parseInt(newFeature.value.modelId));
  const feature = {
    id: features.value.length + 1,
    name: newFeature.value.name,
    modelName: model ? model.name : '未知模型',
    status: newFeature.value.status,
    createdAt: new Date().toISOString().split('T')[0]
  };
  features.value.push(feature);
  stats.value.features++;
  showAddFeatureModal.value = false;
  // 重置表单
  newFeature.value = {
    name: '',
    modelId: '',
    status: 'active'
  };
};

// 编辑模型
const editModel = (model) => {
  // 实现编辑功能
  console.log('编辑模型:', model);
};

// 删除模型
const deleteModel = (id) => {
  if (confirm('确定要删除这个模型吗？')) {
    models.value = models.value.filter(model => model.id !== id);
    stats.value.models--;
  }
};

// 编辑功能
const editFeature = (feature) => {
  // 实现编辑功能
  console.log('编辑功能:', feature);
};

// 删除功能
const deleteFeature = (id) => {
  if (confirm('确定要删除这个功能吗？')) {
    features.value = features.value.filter(feature => feature.id !== id);
    stats.value.features--;
  }
};

onMounted(() => {
  // 加载AI模型和功能数据
  console.log('加载AI功能数据');
});
</script>

<style scoped>
.ai-container {
  padding: 20px;
}

.ai-header {
  margin-bottom: 30px;
}

.ai-header h2 {
  margin-bottom: 8px;
  color: #1a202c;
}

.ai-header p {
  margin: 0;
}

.ai-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.ai-models,
.ai-features {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #1a202c;
}

.add-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #2563eb;
}

.model-list,
.feature-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.model-table,
.feature-table {
  width: 100%;
  border-collapse: collapse;
}

.model-table th,
.model-table td,
.feature-table th,
.feature-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.model-table th,
.feature-table th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.model-table tr:hover,
.feature-table tr:hover {
  background-color: #f7fafc;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-badge.inactive {
  background-color: #fed7d7;
  color: #742a2a;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.3s ease;
}

.action-btn.edit {
  color: #3b82f6;
}

.action-btn.edit:hover {
  background-color: #dbeafe;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #1a202c;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background-color: #f7fafc;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #edf2f7;
}

.btn-submit {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-submit:hover {
  background-color: #2563eb;
}
</style>