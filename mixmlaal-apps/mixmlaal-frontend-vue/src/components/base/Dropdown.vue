<template>
  <div class="dropdown" :class="{ 'is-open': isOpen }">
    <button 
      class="dropdown-toggle" 
      @click="toggleDropdown"
      :class="toggleClass"
      :disabled="disabled"
    >
      <slot name="toggle">{{ label }}</slot>
      <span class="dropdown-icon">
        <i class="fas fa-chevron-down"></i>
      </span>
    </button>
    <div class="dropdown-menu" v-if="isOpen" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: 'Dropdown'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  toggleClass: {
    type: String,
    default: ''
  }
});

const isOpen = ref(false);

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 4px;
  background-color: var(--color-white);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  border-color: var(--color-blue-500);
}

.dropdown-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-icon {
  margin-left: 8px;
  font-size: 12px;
  color: var(--color-gray-500);
  transition: transform 0.2s ease;
}

.is-open .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  margin-top: 4px;
  padding: 8px 0;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--color-gray-100);
}

.dropdown-item:active {
  background-color: var(--color-gray-200);
}
</style>