/**
 * 权限指令插件
 * 用于在模板中进行权限控制
 */
import { hasPermission, hasRole } from '../utils/security';

export default {
  install(app) {
    // v-permission 指令：根据权限显示或隐藏元素
    app.directive('permission', {
      mounted(el, binding) {
        const permission = binding.value;
        if (!permission) return;
        
        if (!hasPermission(permission)) {
          el.style.display = 'none';
        }
      },
      updated(el, binding) {
        const permission = binding.value;
        if (!permission) return;
        
        if (!hasPermission(permission)) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      }
    });
    
    // v-role 指令：根据角色显示或隐藏元素
    app.directive('role', {
      mounted(el, binding) {
        const role = binding.value;
        if (!role) return;
        
        if (!hasRole(role)) {
          el.style.display = 'none';
        }
      },
      updated(el, binding) {
        const role = binding.value;
        if (!role) return;
        
        if (!hasRole(role)) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      }
    });
    
    // 全局方法：检查权限
    app.config.globalProperties.$hasPermission = hasPermission;
    app.config.globalProperties.$hasRole = hasRole;
  }
};