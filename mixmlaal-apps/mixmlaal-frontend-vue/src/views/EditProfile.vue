<template>
  <div class="edit-profile-page">
    <div class="container">
      <header class="page-header">
        <button class="back-btn" @click="$router.back()">←</button>
        <h1>{{ $t('editProfile.title') }}</h1>
        <button class="save-btn" @click="saveProfile">{{ $t('editProfile.save') }}</button>
      </header>

      <div class="avatar-upload">
        <div class="avatar-preview">
          <img :src="form.avatar || defaultAvatar" alt="avatar" />
        </div>
        <button class="upload-btn">{{ $t('editProfile.changeAvatar') }}</button>
      </div>

      <div class="form-section">
        <div class="form-item">
          <label>{{ $t('editProfile.nickname') }}</label>
          <input v-model="form.nickname" type="text" :placeholder="$t('editProfile.nicknamePlaceholder')" />
        </div>

        <div class="form-item">
          <label>{{ $t('editProfile.gender') }}</label>
          <div class="gender-options">
            <button
              v-for="g in genders"
              :key="g.value"
              :class="{ active: form.gender === g.value }"
              @click="form.gender = g.value"
            >
              {{ g.label }}
            </button>
          </div>
        </div>

        <div class="form-item">
          <label>{{ $t('editProfile.birthday') }}</label>
          <input v-model="form.birthday" type="date" />
        </div>

        <div class="form-item">
          <label>{{ $t('editProfile.bio') }}</label>
          <textarea v-model="form.bio" rows="4" :placeholder="$t('editProfile.bioPlaceholder')"></textarea>
        </div>

        <div class="form-item">
          <label>{{ $t('editProfile.location') }}</label>
          <input v-model="form.location" type="text" :placeholder="$t('editProfile.locationPlaceholder')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditProfile',
  data() {
    return {
      defaultAvatar: 'https://via.placeholder.com/100',
      form: {
        nickname: '',
        gender: '',
        birthday: '',
        bio: '',
        location: '',
        avatar: null,
      },
      genders: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '保密', value: 'secret' },
      ],
    };
  },
  methods: {
    async saveProfile() {
      console.log('Save profile:', this.form);
      this.$router.back();
    },
  },
};
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.page-header h1 {
  font-size: 18px;
  color: #333;
}

.save-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: white;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  padding: 8px 20px;
  background: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.form-section {
  background: white;
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.form-item textarea {
  resize: vertical;
}

.gender-options {
  display: flex;
  gap: 10px;
}

.gender-options button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.gender-options button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}
</style>