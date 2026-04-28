<template>
  <div class="version-display">
    <span class="version-text">{{ versionInfo.version }}</span>
    <span class="version-divider">|</span>
    <span class="version-build">Build {{ versionInfo.build }}</span>
  </div>
</template>

<script setup>
import { getVersion } from '../../../scripts/version.js';

const versionInfo = getVersion();
</script>

<style scoped>
.version-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-gray-500);
}

.version-text {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.version-divider {
  opacity: 0.5;
}

.version-build {
  opacity: 0.7;
}
</style>
