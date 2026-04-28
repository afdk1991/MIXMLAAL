<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">社交中心</h1>
    
    <!-- 邀请好友 -->
    <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white mb-8">
      <h2 class="text-xl font-semibold mb-4">邀请好友</h2>
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="mb-4 md:mb-0">
          <p class="mb-2">邀请好友注册，双方均可获得奖励</p>
          <div class="flex items-center">
            <div class="text-2xl font-bold mr-4">¥20</div>
            <div class="text-sm opacity-80">
              <p>好友注册并完成首单</p>
              <p>你和好友各得20元优惠券</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div class="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
            <div class="text-center">
              <div class="text-sm mb-2">邀请码</div>
              <div class="font-mono text-lg font-bold">{{ inviteCode }}</div>
            </div>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="copyInviteCode"
              class="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-opacity-90 transition-colors duration-200"
            >
              <i class="fa fa-copy mr-1"></i> 复制
            </button>
            <button 
              @click="shareInvite"
              class="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-opacity-90 transition-colors duration-200"
            >
              <i class="fa fa-share-alt mr-1"></i> 分享
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 邀请记录 -->
    <div class="bg-white rounded-xl shadow-card p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">邀请记录</h2>
      <div class="space-y-3">
        <div v-for="invite in inviteRecords" :key="invite.id" class="flex justify-between items-center p-3 border-b">
          <div>
            <div class="font-medium">{{ invite.friendName }}</div>
            <div class="text-sm text-gray-600">{{ invite.date }}</div>
          </div>
          <div :class="invite.status === 'completed' ? 'text-green-600' : 'text-yellow-600'">
            {{ invite.status === 'completed' ? '已完成' : '待完成' }}
          </div>
        </div>
        <div v-if="inviteRecords.length === 0" class="text-center py-4 text-gray-500">
          暂无邀请记录
        </div>
      </div>
    </div>

    <!-- 分享活动 -->
    <div class="bg-white rounded-xl shadow-card p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">分享活动</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="activity in activities" :key="activity.id" class="border rounded-lg overflow-hidden">
          <div class="h-40 bg-gray-200 relative">
            <img :src="activity.image" :alt="activity.title" class="w-full h-full object-cover">
            <div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {{ activity.tag }}
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-medium mb-2">{{ activity.title }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ activity.description }}</p>
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-500">
                剩余: {{ activity.remaining }}/{{ activity.total }}
              </div>
              <button 
                @click="shareActivity(activity.id)"
                class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors duration-200"
              >
                分享
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 好友列表 -->
    <div class="bg-white rounded-xl shadow-card p-6">
      <h2 class="text-xl font-semibold mb-4">我的好友</h2>
      <div class="space-y-3">
        <div v-for="friend in friends" :key="friend.id" class="flex items-center p-3 border-b">
          <img :src="friend.avatar" alt="好友头像" class="w-10 h-10 rounded-full mr-3">
          <div class="flex-1">
            <div class="font-medium">{{ friend.name }}</div>
            <div class="text-xs text-gray-500">{{ friend.lastActive }}</div>
          </div>
          <button class="text-blue-600 hover:text-blue-700 transition-colors duration-200">
            <i class="fa fa-message"></i>
          </button>
        </div>
        <div v-if="friends.length === 0" class="text-center py-4 text-gray-500">
          暂无好友
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const inviteCode = ref('MIX888');
const inviteRecords = ref([
  {
    id: 1,
    friendName: '张三',
    date: '2026-04-10 10:30',
    status: 'completed'
  },
  {
    id: 2,
    friendName: '李四',
    date: '2026-04-09 15:45',
    status: 'pending'
  }
]);

// 活动列表
const activities = ref([
  {
    id: 1,
    title: '新用户专享优惠',
    description: '邀请好友注册，双方均可获得20元优惠券',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=promotional%20banner%20for%20new%20user%20reward&image_size=landscape_16_9',
    tag: '热门',
    total: 1000,
    remaining: 850
  },
  {
    id: 2,
    title: '周末特惠活动',
    description: '分享活动页面，即可获得5元无门槛优惠券',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=weekend%20promotion%20banner&image_size=landscape_16_9',
    tag: '限时',
    total: 500,
    remaining: 230
  }
]);

// 好友列表
const friends = ref([
  {
    id: 1,
    name: '张三',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20user%20avatar&image_size=square',
    lastActive: '10分钟前'
  },
  {
    id: 2,
    name: '李四',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=female%20user%20avatar&image_size=square',
    lastActive: '1小时前'
  }
]);

// 组件挂载时检查登录状态
onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
  }
});

// 复制邀请码
function copyInviteCode() {
  navigator.clipboard.writeText(inviteCode.value).then(() => {
    alert('邀请码已复制');
  });
}

// 分享邀请
function shareInvite() {
  if (navigator.share) {
    navigator.share({
      title: '邀请你加入MIXMLAAL',
      text: `使用我的邀请码 ${inviteCode.value} 注册MIXMLAAL，双方均可获得20元优惠券！`,
      url: window.location.origin
    });
  } else {
    // 降级方案
    copyInviteCode();
    alert('邀请链接已复制，请分享给好友');
  }
}

// 分享活动
function shareActivity(activityId) {
  const activity = activities.value.find(a => a.id === activityId);
  if (activity) {
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.description,
        url: window.location.origin
      });
    } else {
      alert('活动链接已复制，请分享给好友');
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>