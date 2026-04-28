<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <div class="input-container">
      <span v-if="prefix" class="input-prefix" aria-hidden="true">
        <i :class="prefix"></i>
      </span>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-label="ariaLabel"
        :aria-describedby="error ? `${id}-error` : helper ? `${id}-helper` : undefined"
        :aria-invalid="!!error"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @change="$emit('change', $event)"
        @keydown.enter="$emit('enter', $event)"
        :class="[
          'input',
          { 'input-error': error },
          { 'input-disabled': disabled },
          { 'input-readonly': readonly }
        ]"
      />
      <span v-if="suffix" class="input-suffix" aria-hidden="true">
        <i :class="suffix"></i>
      </span>
      <button 
        v-if="clearable && modelValue && !disabled && !readonly" 
        class="input-clear" 
        @click="clearInput"
        :aria-label="`清除${label || '输入'}`"
        tabindex="0"
        @keydown.enter="clearInput"
        @keydown.space="clearInput"
      >
        <i class="fa fa-times-circle" aria-hidden="true"></i>
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="input-error">{{ error }}</p>
    <p v-if="helper && !error" :id="`${id}-helper`" class="input-helper">{{ helper }}</p>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'password', 'email', 'tel', 'number', 'search', 'url'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helper: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'full'].includes(value)
  },
  ariaLabel: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change', 'enter']);

function clearInput() {
  emit('update:modelValue', '');
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--tw-color-text-primary);
  transition: all 0.2s ease;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--tw-color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 400;
  transition: all 0.2s ease;
  background-color: var(--tw-color-card);
  color: var(--tw-color-text-primary);
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.input:focus {
  outline: none;
  border-color: var(--tw-color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.input:active {
  transform: translateY(0);
}

.input-clear:hover {
  background-color: var(--tw-color-background);
  color: var(--tw-color-text-primary);
  transform: scale(1.1);
}

.input-clear:active {
  transform: scale(0.9);
}

.input-error {
  border-color: var(--tw-color-danger) !important;
}

.input-error:focus {
  border-color: var(--tw-color-danger) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.input-disabled {
  background-color: var(--tw-color-background) !important;
  border-color: var(--tw-color-border) !important;
  color: var(--tw-color-text-disabled) !important;
  cursor: not-allowed !important;
}

.input-readonly {
  background-color: var(--tw-color-background) !important;
  border-color: var(--tw-color-border) !important;
  color: var(--tw-color-text-secondary) !important;
  cursor: default !important;
}

.input-prefix {
  position: absolute;
  left: 1rem;
  color: var(--tw-color-text-tertiary);
  pointer-events: none;
  transition: all 0.2s ease;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  color: var(--tw-color-text-tertiary);
  pointer-events: none;
  transition: all 0.2s ease;
}

.input-clear {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--tw-color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.input-clear:hover {
  background-color: var(--tw-color-background);
  color: var(--tw-color-text-primary);
}

.input-error-text {
  font-size: 0.75rem;
  color: var(--tw-color-danger);
  margin: 0;
  transition: all 0.2s ease;
}

.input-helper {
  font-size: 0.75rem;
  color: var(--tw-color-text-tertiary);
  margin: 0;
  transition: all 0.2s ease;
}

/* Sizes */
.input-sm {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.75rem !important;
  border-radius: 0.25rem !important;
}

.input-md {
  padding: 0.75rem 1rem !important;
  font-size: 0.875rem !important;
  border-radius: 0.375rem !important;
}

.input-lg {
  padding: 1rem 1.25rem !important;
  font-size: 1rem !important;
  border-radius: 0.5rem !important;
}

/* Rounded */
.input-rounded-sm {
  border-radius: 0.25rem !important;
}

.input-rounded-md {
  border-radius: 0.375rem !important;
}

.input-rounded-lg {
  border-radius: 0.5rem !important;
}

.input-rounded-full {
  border-radius: 9999px !important;
}

/* 带前缀的输入框 */
.input-container:has(.input-prefix) .input {
  padding-left: 3rem !important;
}

/* 带后缀的输入框 */
.input-container:has(.input-suffix) .input,
.input-container:has(.input-clear) .input {
  padding-right: 3rem !important;
}
</style>