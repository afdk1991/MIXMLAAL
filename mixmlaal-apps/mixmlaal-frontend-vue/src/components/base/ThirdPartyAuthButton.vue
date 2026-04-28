<template>
  <div
    @click="handleClick"
    class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
  >
    <span class="sr-only">{{ getProviderName(provider) }}</span>
    <i :class="getProviderIcon(provider)"></i>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  provider: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
});

const emit = defineEmits(['click']);

function handleClick() {
  emit('click', props.provider);
}

function getProviderName(provider) {
  const names = {
    wechat: '使用微信登录',
    qq: '使用 QQ 登录',
    apple: '使用 Apple 登录',
    alipay: '使用支付宝登录',
    google: '使用 Google 登录',
    facebook: '使用 Facebook 登录',
    twitter: '使用 Twitter 登录',
    github: '使用 GitHub 登录',
    linkedin: '使用 LinkedIn 登录',
    instagram: '使用 Instagram 登录',
    discord: '使用 Discord 登录',
    slack: '使用 Slack 登录',
    twitch: '使用 Twitch 登录',
    microsoft: '使用 Microsoft 登录',
    yahoo: '使用 Yahoo 登录',
    tumblr: '使用 Tumblr 登录',
    pinterest: '使用 Pinterest 登录',
    reddit: '使用 Reddit 登录',
    snapchat: '使用 Snapchat 登录',
    line: '使用 LINE 登录',
    kakao: '使用 KakaoTalk 登录',
    naver: '使用 Naver 登录',
    vk: '使用 VKontakte 登录',
    weibo: '使用 Weibo 登录'
  };
  return names[provider] || `使用 ${provider} 登录`;
}

function getProviderIcon(provider) {
  const icons = {
    wechat: 'fab fa-weixin text-green-500 text-xl',
    qq: 'fab fa-qq text-blue-500 text-xl',
    apple: 'fab fa-apple text-text-primary text-xl',
    alipay: 'fab fa-alipay text-blue-600 text-xl',
    google: 'fab fa-google text-red-500 text-xl',
    facebook: 'fab fa-facebook text-blue-600 text-xl',
    twitter: 'fab fa-twitter text-blue-400 text-xl',
    github: 'fab fa-github text-text-primary text-xl',
    linkedin: 'fab fa-linkedin text-blue-700 text-xl',
    instagram: 'fab fa-instagram text-pink-500 text-xl',
    discord: 'fab fa-discord text-purple-600 text-xl',
    slack: 'fab fa-slack text-purple-500 text-xl',
    twitch: 'fab fa-twitch text-purple-700 text-xl',
    microsoft: 'fab fa-windows text-blue-600 text-xl',
    yahoo: 'fab fa-yahoo text-purple-500 text-xl',
    tumblr: 'fab fa-tumblr text-blue-400 text-xl',
    pinterest: 'fab fa-pinterest text-red-500 text-xl',
    reddit: 'fab fa-reddit text-orange-500 text-xl',
    snapchat: 'fab fa-snapchat text-yellow-500 text-xl',
    line: 'fab fa-line text-green-500 text-xl',
    kakao: 'fab fa-kakao text-yellow-400 text-xl',
    naver: 'fab fa-naver text-green-600 text-xl',
    vk: 'fab fa-vk text-blue-500 text-xl',
    weibo: 'fab fa-weibo text-red-500 text-xl'
  };
  return icons[provider] || 'fab fa-user text-text-tertiary text-xl';
}
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>