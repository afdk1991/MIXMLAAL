import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 构建分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    // 压缩静态资源
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240 // 10KB以上才压缩
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240 // 10KB以上才压缩
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/frontend/src')
    }
  },
  build: {
    // 生产环境构建配置
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 静态资源文件名带哈希值，便于缓存
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库单独打包
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          utils: ['axios', 'lodash-es']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  // CDN配置
  base: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.example.com/mixmlaal/' 
    : '/'
});
