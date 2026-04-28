# 项目访问说明

## 系统已成功启动

服务器正在端口 3006 上运行，请通过以下方式访问项目：

### 访问地址
- 主页: http://localhost:3006
- 项目管理系统: http://localhost:3006/navigation.html
- 主控制面板: http://localhost:3006/main-navigation.html
- 博客系统: http://localhost:3006/blog-navigation.html
- 社交系统: http://localhost:3006/social-navigation.html
- 商城系统: http://localhost:3006/shop-navigation.html
- 系统测试页面: http://localhost:3006/test.html

### 如果遇到"内容空白"问题，请尝试以下解决方案：

1. **清除浏览器缓存**
   - 按 Ctrl + Shift + Delete
   - 选择"缓存的图片和文件"
   - 点击"清除数据"
   - 刷新页面 (F5)

2. **使用无痕模式**
   - 按 Ctrl + Shift + N (Chrome/Edge)
   - 或按 Ctrl + Shift + P (Firefox)
   - 访问 http://localhost:3006

3. **重启服务器**
   - 关闭当前终端
   - 重新运行: node server.js
   - 等待启动完成后再访问

4. **检查端口占用**
   - 运行: netstat -ano | findstr :3006
   - 如果有结果，运行: taskkill /PID [进程ID] /F
   - 重新启动服务器

### 系统功能模块

1. **企业级项目管理系统**
   - 项目组合管理
   - 项目集管理
   - 项目管理
   - 团队管理

2. **博客系统**
   - 文章发布与管理
   - 分类管理
   - 评论系统

3. **社交系统**
   - 用户动态
   - 关注系统
   - 私信功能

4. **商城系统**
   - 商品管理
   - 购物车
   - 订单处理

如需帮助，请访问系统测试页面: http://localhost:3006/test.html