<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">会员中心</h1>

    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white mb-8">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold mb-2">会员等级</h2>
          <div class="flex items-center mb-4">
            <div class="text-3xl font-bold mr-4">{{ membership.membershipLevel || '普通会员' }}</div>
            <div class="text-sm opacity-80">
              <p v-if="membership.membershipExpiry">到期时间: {{ formatDate(membership.membershipExpiry) }}</p>
              <p v-else>永久有效</p>
            </div>
          </div>
        </div>
        <div class="mt-4 md:mt-0 text-center md:text-right">
          <div class="text-2xl font-bold mb-2">{{ membership.points || 0 }}</div>
          <div class="text-sm">可用积分</div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-white/20">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">成长值</span>
          <span class="text-sm">{{ membership.growthPoints || 0 }}</span>
        </div>
        <div class="w-full bg-white/20 rounded-full h-2">
          <div
            class="bg-yellow-400 h-2 rounded-full transition-all duration-500"
            :style="{ width: growthProgress + '%' }"
          ></div>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs opacity-70">当前成长值</span>
          <span class="text-xs opacity-70">下一级: {{ nextLevelGrowthPoints }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-card p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">我的权益</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-2">💰</div>
          <div class="text-sm text-gray-600">专属折扣</div>
          <div class="text-lg font-bold text-blue-600">{{ currentDiscount }}%</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-2">🎯</div>
          <div class="text-sm text-gray-600">积分倍数</div>
          <div class="text-lg font-bold text-blue-600">{{ currentPointsMultiplier }}x</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-2">🎁</div>
          <div class="text-sm text-gray-600">专属客服</div>
          <div class="text-lg font-bold text-blue-600">{{ hasPrioritySupport ? '是' : '否' }}</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl mb-2">🚀</div>
          <div class="text-sm text-gray-600">优先配送</div>
          <div class="text-lg font-bold text-blue-600">{{ hasPriorityDelivery ? '是' : '否' }}</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-card p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">会员等级</h2>
      <div class="space-y-4">
        <div
          v-for="level in membershipLevels"
          :key="level.id"
          class="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300"
          :class="{ 'border-blue-500 bg-blue-50': level.level === membership.membershipLevel }"
        >
          <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" :class="getLevelColor(level.level)">
            <span class="text-white font-bold">{{ level.name.charAt(0) }}</span>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <h3 class="font-medium">{{ level.name }}</h3>
              <span v-if="level.level === membership.membershipLevel" class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs animate-pulse">当前等级</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ level.benefits }}</p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">折扣: {{ level.discount }}%</span>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">积分倍数: {{ level.pointsMultiplier }}x</span>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">有效期: {{ level.duration }}天</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold mb-2">¥{{ level.price }}</div>
            <button
              v-if="level.level !== membership.membershipLevel"
              @click="upgradeMembership(level.id)"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              立即升级
            </button>
            <button
              v-else-if="membership.membershipLevel !== 'normal'"
              @click="renewMembership"
              class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-all duration-200 hover:scale-105"
            >
              续费
            </button>
            <div v-else class="px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm">
              已拥有
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-card p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">成长任务</h2>
        <div class="flex gap-2">
          <button
            v-for="tab in taskTabs"
            :key="tab.value"
            @click="currentTaskTab = tab.value"
            class="px-3 py-1 rounded-full text-sm transition-all duration-200"
            :class="currentTaskTab === tab.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="space-y-3">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="p-4 border rounded-lg transition-all duration-300"
          :class="{
            'opacity-50': !task.isUnlocked,
            'border-green-500 bg-green-50': task.isCompleted && !task.isClaimed,
            'border-gray-200': !task.isCompleted
          }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="text-3xl mr-4">{{ task.icon }}</div>
              <div>
                <div class="font-medium">{{ task.name }}</div>
                <div class="text-sm text-gray-600">{{ task.description }}</div>
                <div class="flex items-center mt-2">
                  <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      :style="{ width: Math.min((task.progress / task.target) * 100, 100) + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ task.progress }}/{{ task.target }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500 mb-1">奖励</div>
              <div class="text-sm font-bold text-orange-600">+{{ task.rewardPoints }}积分</div>
              <div class="text-xs text-gray-400">+{{ task.rewardGrowthPoints }}成长值</div>
              <button
                v-if="task.isUnlocked && task.isCompleted && !task.isClaimed"
                @click="claimTaskReward(task.id)"
                class="mt-2 px-4 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-all duration-200 animate-bounce"
              >
                领取
              </button>
              <div v-else-if="task.isClaimed" class="mt-2 px-4 py-1 bg-gray-200 text-gray-500 rounded-full text-sm">
                已领取
              </div>
              <div v-else-if="!task.isUnlocked" class="mt-2 px-4 py-1 bg-gray-200 text-gray-400 rounded-full text-sm">
                等级不足
              </div>
            </div>
          </div>
        </div>
        <div v-if="filteredTasks.length === 0" class="text-center py-8 text-gray-500">
          暂无任务
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-card p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">积分明细</h2>
        <button
          @click="togglePointsHistory"
          class="text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          {{ showPointsHistory ? '收起' : '查看更多' }}
        </button>
      </div>
      <div class="space-y-3">
        <div
          v-for="record in pointsHistory.slice(0, showPointsHistory ? pointsHistory.length : 5)"
          :key="record.id"
          class="flex justify-between items-center p-3 border-b transition-all duration-200 hover:bg-gray-50"
        >
          <div>
            <div class="font-medium">{{ record.reason }}</div>
            <div class="text-sm text-gray-600">{{ formatDate(record.createdAt) }}</div>
          </div>
          <div :class="record.type === 'earn' ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ record.type === 'earn' ? '+' : '' }}{{ record.points }}
          </div>
        </div>
        <div v-if="pointsHistory.length === 0" class="text-center py-4 text-gray-500">
          暂无积分记录
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-card p-6">
      <h2 class="text-xl font-semibold mb-4">积分兑换</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="item in redeemItems"
          :key="item.id"
          class="border rounded-lg p-4 hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        >
          <div class="text-center mb-3">
            <div class="text-3xl mb-2">{{ item.icon }}</div>
            <h3 class="font-medium">{{ item.name }}</h3>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-red-600 font-bold">{{ item.points }} 积分</div>
            <button
              @click="redeemItem(item.id)"
              :disabled="membership.points < item.points"
              class="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105"
            >
              兑换
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const showPointsHistory = ref(false);
const currentTaskTab = ref('all');
const membership = ref({
  membershipLevel: 'normal',
  membershipExpiry: null,
  points: 0,
  growthPoints: 0
});

const membershipLevels = ref([]);
const pointsHistory = ref([]);
const tasks = ref([]);
const redeemItems = ref([
  { id: 1, name: '5元优惠券', points: 500, icon: '🎫' },
  { id: 2, name: '10元优惠券', points: 1000, icon: '🎟️' },
  { id: 3, name: '20元优惠券', points: 2000, icon: '🎁' }
]);

const taskTabs = [
  { label: '全部', value: 'all' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '成就', value: 'once' }
];

const currentLevelIndex = computed(() => {
  return ['normal', 'bronze', 'silver', 'gold', 'platinum'].indexOf(membership.value.membershipLevel);
});

const currentDiscount = computed(() => {
  const level = membershipLevels.value.find(l => l.level === membership.value.membershipLevel);
  return level ? level.discount : 0;
});

const currentPointsMultiplier = computed(() => {
  const level = membershipLevels.value.find(l => l.level === membership.value.membershipLevel);
  return level ? level.pointsMultiplier : 1;
});

const hasPrioritySupport = computed(() => {
  return currentLevelIndex.value >= 2;
});

const hasPriorityDelivery = computed(() => {
  return currentLevelIndex.value >= 3;
});

const growthProgress = computed(() => {
  const levelThresholds = [0, 1000, 3000, 6000, 10000];
  const currentThreshold = levelThresholds[currentLevelIndex.value] || 0;
  const nextThreshold = levelThresholds[currentLevelIndex.value + 1] || levelThresholds[levelThresholds.length - 1];
  const progress = membership.value.growthPoints - currentThreshold;
  const total = nextThreshold - currentThreshold;
  return Math.min((progress / total) * 100, 100);
});

const nextLevelGrowthPoints = computed(() => {
  const levelThresholds = [0, 1000, 3000, 6000, 10000];
  const nextThreshold = levelThresholds[currentLevelIndex.value + 1] || levelThresholds[levelThresholds.length - 1];
  return nextThreshold;
});

const filteredTasks = computed(() => {
  if (currentTaskTab.value === 'all') {
    return tasks.value;
  }
  return tasks.value.filter(task => task.type === currentTaskTab.value);
});

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  await Promise.all([
    loadMembershipInfo(),
    loadMembershipLevels(),
    loadPointsHistory(),
    loadTasks()
  ]);
});

async function loadMembershipInfo() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const response = await fetch('/api/v1/membership/user', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.code === 200) {
      membership.value = { ...membership.value, ...data.data };
    }
  } catch (error) {
    console.error('加载会员信息失败:', error);
  }
}

async function loadMembershipLevels() {
  try {
    const response = await fetch('/api/v1/membership/levels');
    const data = await response.json();
    if (data.code === 200) {
      membershipLevels.value = data.data;
    }
  } catch (error) {
    console.error('加载会员等级失败:', error);
  }
}

async function loadPointsHistory() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const response = await fetch('/api/v1/membership/points/history', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.code === 200) {
      pointsHistory.value = data.data.items || [];
    }
  } catch (error) {
    console.error('加载积分历史失败:', error);
  }
}

async function loadTasks() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const response = await fetch('/api/v1/growth-tasks/', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.code === 200) {
      tasks.value = data.data || [];
    }
  } catch (error) {
    console.error('加载任务列表失败:', error);
  }
}

async function upgradeMembership(levelId) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const response = await fetch('/api/v1/membership/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ levelId })
    });

    const data = await response.json();
    if (data.code === 200) {
      alert('升级会员成功');
      await loadMembershipInfo();
    } else {
      alert('升级会员失败: ' + data.message);
    }
  } catch (error) {
    console.error('升级会员失败:', error);
    alert('升级会员失败，请稍后重试');
  }
}

async function renewMembership() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const months = prompt('请输入续费月数:', '3');
    if (!months || isNaN(months) || months <= 0) return;

    const response = await fetch('/api/v1/membership/renew', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ months: parseInt(months) })
    });

    const data = await response.json();
    if (data.code === 200) {
      alert('续费会员成功');
      await loadMembershipInfo();
    } else {
      alert('续费会员失败: ' + data.message);
    }
  } catch (error) {
    console.error('续费会员失败:', error);
    alert('续费会员失败，请稍后重试');
  }
}

async function claimTaskReward(taskId) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const response = await fetch('/api/v1/growth-tasks/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ taskId })
    });

    const data = await response.json();
    if (data.code === 200) {
      alert('领取奖励成功');
      await Promise.all([
        loadMembershipInfo(),
        loadTasks()
      ]);
    } else {
      alert('领取奖励失败: ' + data.message);
    }
  } catch (error) {
    console.error('领取奖励失败:', error);
    alert('领取奖励失败，请稍后重试');
  }
}

async function redeemItem(itemId) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const item = redeemItems.value.find(i => i.id === itemId);
    if (!item) return;

    if (membership.value.points < item.points) {
      alert('积分不足');
      return;
    }

    const response = await fetch('/api/v1/membership/points/spend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        points: item.points,
        reason: `兑换${item.name}`
      })
    });

    const data = await response.json();
    if (data.code === 200) {
      alert('兑换成功');
      await Promise.all([
        loadMembershipInfo(),
        loadPointsHistory()
      ]);
    } else {
      alert('兑换失败: ' + data.message);
    }
  } catch (error) {
    console.error('兑换失败:', error);
    alert('兑换失败，请稍后重试');
  }
}

function togglePointsHistory() {
  showPointsHistory.value = !showPointsHistory.value;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}

function getLevelColor(level) {
  const colors = {
    normal: 'bg-gray-500',
    bronze: 'bg-amber-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-blue-400'
  };
  return colors[level] || 'bg-gray-500';
}
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>