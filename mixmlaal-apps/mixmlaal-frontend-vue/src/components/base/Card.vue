<template>
  <div :class="[
    'card',
    `card-${variant}`,
    `card-shadow-${shadow}`,
    `card-rounded-${rounded}`
  ]">
    <div v-if="header || $slots.header" class="card-header">
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="footer || $slots.footer" class="card-footer">
      <slot name="footer">{{ footer }}</slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined', 'filled'].includes(value)
  },
  shadow: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  header: {
    type: String,
    default: ''
  },
  footer: {
    type: String,
    default: ''
  },
  hoverable: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.card {
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--tw-color-card);
}

.card:hover {
  transform: translateY(-2px);
}

/* Shadow */
.card-shadow-none {
  box-shadow: none;
}

.card-shadow-sm {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.card-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Rounded */
.card-rounded-sm {
  border-radius: 0.25rem;
}

.card-rounded-md {
  border-radius: 0.375rem;
}

.card-rounded-lg {
  border-radius: 0.5rem;
}

.card-rounded-xl {
  border-radius: 0.75rem;
}

.card-rounded-full {
  border-radius: 9999px;
}

/* Variants */
.card-default {
  background-color: var(--tw-color-card);
  border: 1px solid var(--tw-color-border);
}

.card-elevated {
  background-color: var(--tw-color-card);
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-outlined {
  background-color: var(--tw-color-card);
  border: 1px solid var(--tw-color-border);
}

.card-filled {
  background-color: var(--tw-color-background);
  border: none;
}

/* Header */
.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--tw-color-border);
  font-weight: 600;
  font-size: 1rem;
  color: var(--tw-color-text-primary);
  background-color: var(--tw-color-card);
}

/* Body */
.card-body {
  padding: 1.25rem;
  background-color: var(--tw-color-card);
}

/* Footer */
.card-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--tw-color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: var(--tw-color-card);
}
</style>