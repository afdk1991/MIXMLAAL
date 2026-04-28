<template>
  <div class="address-import-container">
    <div class="import-guide">
      <h3 class="guide-title">批量导入地址</h3>
      <p class="guide-text">支持Excel、CSV、TXT格式文件</p>
      <p class="guide-text">文件格式要求：</p>
      <p class="guide-text">1. 包含字段：姓名、电话、地址</p>
      <p class="guide-text">2. 可选字段：优先级、配送时间</p>
    </div>
    <div class="file-upload">
      <button @click="chooseFile" class="upload-btn">选择文件</button>
      <p v-if="fileInfo" class="file-info">{{ fileInfo.name }}</p>
    </div>
    <div class="options">
      <div class="option-item">
        <span class="option-label">是否覆盖现有地址</span>
        <input 
          type="checkbox" 
          :checked="options.overwrite" 
          @change="options.overwrite = $event.target.checked"
          class="switch"
        />
      </div>
      <div class="option-item">
        <span class="option-label">是否自动地理编码</span>
        <input 
          type="checkbox" 
          :checked="options.geocode" 
          @change="options.geocode = $event.target.checked"
          class="switch"
        />
      </div>
    </div>
    <button @click="importAddress" class="import-btn">导入</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const fileInfo = ref(null);
const options = ref({
  overwrite: false,
  geocode: true
});

function chooseFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv,.txt';
  input.multiple = false;
  
  input.onchange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      fileInfo.value = files[0];
    }
  };
  
  input.click();
}

async function importAddress() {
  if (!fileInfo.value) {
    alert('请选择文件');
    return;
  }
  
  try {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', fileInfo.value);
    formData.append('overwrite', options.value.overwrite);
    formData.append('geocode', options.value.geocode);
    
    const response = await fetch('http://localhost:3000/api/addresses/batch-import', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      alert('导入成功');
      router.back();
    } else {
      alert('导入失败');
    }
  } catch (error) {
    alert('导入失败，请稍后重试');
  }
}
</script>

<style scoped>
.address-import-container {
  padding: 1rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.import-guide {
  background-color: #ffffff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.guide-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333333;
  margin-bottom: 0.5rem;
}

.guide-text {
  font-size: 0.9rem;
  color: #666666;
  margin-bottom: 0.5rem;
  margin: 0 0 0.5rem 0;
}

.file-upload {
  background-color: #ffffff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.upload-btn {
  width: 100%;
  height: 2.5rem;
  background-color: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.upload-btn:hover {
  background-color: #0066cc;
}

.file-info {
  font-size: 0.9rem;
  color: #666666;
  text-align: center;
  margin: 0;
}

.options {
  background-color: #ffffff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.option-label {
  font-size: 0.9rem;
  color: #333333;
}

.switch {
  width: 40px;
  height: 20px;
  position: relative;
  appearance: none;
  background: #ccc;
  outline: none;
  border-radius: 10px;
  transition: .3s;
  cursor: pointer;
}

.switch:checked {
  background: #4CD964;
}

.switch:before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  top: 1px;
  left: 1px;
  transition: .3s;
}

.switch:checked:before {
  left: 21px;
}

.import-btn {
  width: 100%;
  height: 2.5rem;
  background-color: #4CD964;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.import-btn:hover {
  background-color: #34a853;
}
</style>