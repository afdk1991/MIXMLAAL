<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-block': block },
      { 'btn-disabled': disabled || loading }
    ]"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
    @keydown.enter="$emit('click', $event)"
    @keydown.space="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-loading" aria-hidden="true">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <span v-else-if="icon" class="btn-icon" aria-hidden="true">
      <i :class="icon"></i>
    </span>
    <slot></slot>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'outline', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  ariaLabel: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.btn:hover:not(.btn-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:active:not(.btn-disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 0.8;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.btn:focus:not(:focus-visible) {
  box-shadow: none;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-block {
  display: flex;
  width: 100%;
}

/* Variants */
.btn-primary {
  background-color: var(--tw-color-primary);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--tw-color-primary-dark);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-secondary {
  background-color: var(--tw-color-secondary);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: #7c3aed;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-success {
  background-color: var(--tw-color-success);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-success:hover:not(.btn-disabled) {
  background-color: #059669;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-danger {
  background-color: var(--tw-color-danger);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-danger:hover:not(.btn-disabled) {
  background-color: #dc2626;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-warning {
  background-color: var(--tw-color-warning);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-warning:hover:not(.btn-disabled) {
  background-color: #d97706;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-info {
  background-color: var(--tw-color-info);
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.btn-info:hover:not(.btn-disabled) {
  background-color: #2563eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-outline {
  background-color: transparent;
  color: var(--tw-color-primary);
  border: 1px solid var(--tw-color-primary);
  box-shadow: none;
}

.btn-outline:hover:not(.btn-disabled) {
  background-color: var(--tw-color-primary-light);
  box-shadow: none;
}

.btn-text {
  background-color: transparent;
  color: var(--tw-color-primary);
  border: none;
  box-shadow: none;
}

.btn-text:hover:not(.btn-disabled) {
  background-color: var(--tw-color-primary-light);
  box-shadow: none;
}

/* Sizes */
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

.btn-md {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.btn-xl {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
}

/* Loading */
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Icon */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Rounded */
.btn-rounded-sm {
  border-radius: 0.25rem;
}

.btn-rounded-md {
  border-radius: 0.375rem;
}

.btn-rounded-lg {
  border-radius: 0.5rem;
}

.btn-rounded-xl {
  border-radius: 0.75rem;
}

.btn-rounded-full {
  border-radius: 9999px;
}
</style>