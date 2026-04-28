<template>
  <BaseButton 
    :variant="variant" 
    :size="size"
    :class="classes"
    @click="handleClick"
  >
    <i class="fa fa-user text-sm"></i>
    <span v-if="$slots.default"><slot></slot></span>
    <span v-else>我的</span>
  </BaseButton>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from './Button.vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'md'
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const classes = computed(() => {
  return [
    'flex items-center space-x-2',
    props.fullWidth ? 'w-full justify-center' : '',
    props.className
  ];
});

function handleClick() {
  emit('click');
}
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>