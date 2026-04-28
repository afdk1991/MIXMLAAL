<template>
  <view class="ai-container">
    <view class="header">
      <text class="title">智能助手</text>
    </view>
    <view class="ai-features">
      <view class="feature-item" @click="recognizeAddress">
        <view class="feature-icon address-icon"></view>
        <text class="feature-text">地址识别</text>
      </view>
      <view class="feature-item" @click="speechToText">
        <view class="feature-icon speech-icon"></view>
        <text class="feature-text">语音识别</text>
      </view>
      <view class="feature-item" @click="textToSpeech">
        <view class="feature-icon text-icon"></view>
        <text class="feature-text">文本转语音</text>
      </view>
      <view class="feature-item" @click="predictAnomaly">
        <view class="feature-icon anomaly-icon"></view>
        <text class="feature-text">异常预警</text>
      </view>
      <view class="feature-item" @click="customerService">
        <view class="feature-icon service-icon"></view>
        <text class="feature-text">智能客服</text>
      </view>
      <view class="feature-item" @click="predictDemand">
        <view class="feature-icon demand-icon"></view>
        <text class="feature-text">需求预测</text>
      </view>
    </view>
    <view class="ai-chat">
      <text class="section-title">智能对话</text>
      <view class="chat-container">
        <view v-for="(message, index) in messages" :key="index" :class="['chat-message', message.type]">
          <text class="message-text">{{ message.text }}</text>
        </view>
      </view>
      <view class="chat-input">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="请输入您的问题"
          class="input"
        />
        <button @click="sendMessage" class="send-btn">发送</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messages: [
        { type: 'system', text: '您好，我是配送系统智能助手，有什么可以帮您的？' }
      ],
      inputMessage: ''
    };
  },
  methods: {
    async recognizeAddress() {
      uni.showModal({
        title: '地址识别',
        content: '请输入地址文本',
        inputPlaceholder: '请输入地址',
        success: async (res) => {
          if (res.confirm) {
            try {
              const token = uni.getStorageSync('token');
              const response = await uni.request({
                url: 'http://localhost:3000/api/ai/recognize-address',
                method: 'POST',
                header: {
                  Authorization: `Bearer ${token}`
                },
                data: {
                  text: res.inputValue
                }
              });
              
              if (response.data.code === 200) {
                uni.showToast({
                  title: '地址识别成功',
                  icon: 'success'
                });
                this.messages.push({ type: 'user', text: res.inputValue });
                this.messages.push({ type: 'ai', text: JSON.stringify(response.data.data) });
              } else {
                uni.showToast({
                  title: '地址识别失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.showToast({
                title: '地址识别失败，请稍后重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    speechToText() {
      uni.showToast({
        title: '语音识别功能开发中',
        icon: 'none'
      });
    },
    textToSpeech() {
      uni.showModal({
        title: '文本转语音',
        content: '请输入要转换的文本',
        inputPlaceholder: '请输入文本',
        success: async (res) => {
          if (res.confirm) {
            try {
              const token = uni.getStorageSync('token');
              const response = await uni.request({
                url: 'http://localhost:3000/api/ai/text-to-speech',
                method: 'POST',
                header: {
                  Authorization: `Bearer ${token}`
                },
                data: {
                  text: res.inputValue
                }
              });
              
              if (response.data.code === 200) {
                uni.showToast({
                  title: '文本转语音成功',
                  icon: 'success'
                });
                this.messages.push({ type: 'user', text: res.inputValue });
                this.messages.push({ type: 'ai', text: '文本转语音成功，请查收语音文件' });
              } else {
                uni.showToast({
                  title: '文本转语音失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.showToast({
                title: '文本转语音失败，请稍后重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    predictAnomaly() {
      uni.showToast({
        title: '异常预警功能开发中',
        icon: 'none'
      });
    },
    customerService() {
      uni.showToast({
        title: '智能客服功能开发中',
        icon: 'none'
      });
    },
    predictDemand() {
      uni.showToast({
        title: '需求预测功能开发中',
        icon: 'none'
      });
    },
    async sendMessage() {
      if (!this.inputMessage) {
        return;
      }
      
      this.messages.push({ type: 'user', text: this.inputMessage });
      
      try {
        const token = uni.getStorageSync('token');
        const response = await uni.request({
          url: 'http://localhost:3000/api/ai/customer-service',
          method: 'POST',
          header: {
            Authorization: `Bearer ${token}`
          },
          data: {
            message: this.inputMessage
          }
        });
        
        if (response.data.code === 200) {
          this.messages.push({ type: 'ai', text: response.data.data.response });
        } else {
          this.messages.push({ type: 'ai', text: '抱歉，我暂时无法回答这个问题' });
        }
      } catch (error) {
        this.messages.push({ type: 'ai', text: '抱歉，我暂时无法回答这个问题' });
      }
      
      this.inputMessage = '';
    }
  }
};
</script>

<style scoped>
.ai-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.ai-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.feature-item {
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.address-icon {
  background-color: #e3f2fd;
}

.speech-icon {
  background-color: #e8f5e8;
}

.text-icon {
  background-color: #fff3e0;
}

.anomaly-icon {
  background-color: #f3e5f5;
}

.service-icon {
  background-color: #e0f7fa;
}

.demand-icon {
  background-color: #fff8e1;
}

.feature-text {
  font-size: 28rpx;
  color: #333333;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
  display: block;
}

.ai-chat {
  background-color: #ffffff;
  padding: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.chat-container {
  height: 400rpx;
  overflow-y: auto;
  margin-bottom: 20rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
  padding: 10rpx;
}

.chat-message {
  margin-bottom: 10rpx;
  padding: 10rpx;
  border-radius: 5rpx;
  max-width: 80%;
}

.chat-message.user {
  background-color: #e3f2fd;
  align-self: flex-end;
  margin-left: auto;
}

.chat-message.ai {
  background-color: #f0f0f0;
  align-self: flex-start;
}

.chat-message.system {
  background-color: #e8f5e8;
  align-self: center;
  text-align: center;
  margin: 0 auto;
}

.message-text {
  font-size: 24rpx;
  color: #333333;
}

.chat-input {
  display: flex;
  gap: 10rpx;
}

.input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.send-btn {
  padding: 0 30rpx;
  background-color: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 5rpx;
  font-size: 24rpx;
  font-weight: bold;
}
</style>