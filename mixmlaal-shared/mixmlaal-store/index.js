/**
 * 共享状态管理
 * 版本: v1.0.0.0
 * 说明: 使用Pinia管理跨平台状态
 */

import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// 导出状态模块
export * from './integrated';
export * from './user';
