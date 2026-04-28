# MIXMLAAL 开发指南

## 1. 开发环境搭建

### 1.1 系统要求

- **操作系统**：Windows 10+ / macOS 10.15+ / Linux
- **Node.js**：16.14.0+ (推荐 18.x)
- **npm**：8.0.0+ 或 **yarn**：1.22.0+
- **Git**：2.0.0+
- **IDE**：VS Code (推荐) 或 WebStorm

### 1.2 安装步骤

1. **克隆代码**
   ```bash
   git clone <项目地址>
   cd MIXMLAAL
   ```

2. **安装根目录依赖**
   ```bash
   npm install
   ```

3. **安装所有应用依赖**
   ```bash
   npm run install:all
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库连接等信息
   ```

5. **启动开发服务器**
   ```bash
   # 启动API服务
   npm run dev:api
   
   # 启动前端应用
   npm run dev:frontend
   
   # 启动管理后台
   npm run dev:admin
   
   # 启动其他应用
   npm run dev:driver
   npm run dev:h5
   npm run dev:merchant
   npm run dev:react-admin
   ```

## 2. 项目结构

### 2.1 目录结构

```
.
├── apps/                # 应用目录
│   ├── admin/          # Vue管理后台
│   ├── api/            # Node.js API服务
│   ├── driver/         # 司机端应用
│   ├── frontend/       # 前端应用
│   ├── h5/             # H5移动端应用
│   ├── merchant/       # 商家端应用
│   └── react-admin/    # React管理后台
├── docs/               # 文档目录
├── shared/             # 共享代码
├── tests/              # 测试文件
├── .env.example        # 环境变量示例
├── package.json        # 项目配置
└── README.md           # 项目说明
```

### 2.2 应用结构

#### 2.2.1 API服务结构

```
apps/api/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── services/       # 服务
│   ├── utils/          # 工具函数
│   └── app.js          # 应用入口
├── package.json        # 依赖配置
└── server.js           # 服务器入口
```

#### 2.2.2 前端应用结构

```
apps/frontend/
├── src/
│   ├── api/            # API调用
│   ├── components/     # 组件
│   ├── router/         # 路由
│   ├── store/          # 状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面
│   ├── App.vue         # 应用根组件
│   └── main.js         # 应用入口
├── package.json        # 依赖配置
└── vite.config.js      # Vite配置
```

## 3. 开发规范

### 3.1 代码规范

#### 3.1.1 JavaScript/TypeScript

- **ESLint**：使用ESLint检查代码风格
- **Prettier**：使用Prettier格式化代码
- **命名规范**：
  - 变量名：camelCase
  - 函数名：camelCase
  - 类名：PascalCase
  - 常量：UPPER_SNAKE_CASE
  - 文件名：kebab-case

#### 3.1.2 Vue组件

- **组件命名**：PascalCase
- **Props命名**：camelCase
- **事件命名**：kebab-case
- **模板语法**：使用Vue 3组合式API

#### 3.1.3 目录命名

- **目录名**：kebab-case
- **组件目录**：PascalCase
- **工具目录**：kebab-case

### 3.2 提交规范

使用语义化提交格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type** 类型：
- **feat**：新功能
- **fix**：修复bug
- **docs**：文档更新
- **style**：代码风格调整
- **refactor**：代码重构
- **test**：测试相关
- **chore**：构建过程或辅助工具的变动

**Scope** 范围：
- 模块名或文件路径

**Subject** 主题：
- 简洁明了的描述
- 不超过50个字符
- 使用祈使句

### 3.3 分支规范

- **main**：主分支，用于发布生产版本
- **develop**：开发分支，集成所有功能
- **feature/**：功能分支，开发新功能
- **bugfix/**：修复分支，修复bug
- **hotfix/**：紧急修复分支，修复生产环境问题

## 4. 开发流程

### 4.1 新功能开发

1. **创建分支**：从develop分支创建feature分支
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/feature-name
   ```

2. **开发功能**：实现新功能

3. **运行测试**：确保功能正常
   ```bash
   npm test
   ```

4. **提交代码**：
   ```bash
   git add .
   git commit -m "feat(feature-name): 描述新功能"
   git push origin feature/feature-name
   ```

5. **创建PR**：提交Pull Request到develop分支

6. **代码评审**：团队成员评审代码

7. **合并分支**：评审通过后合并到develop分支

### 4.2 Bug修复

1. **创建分支**：从develop分支创建bugfix分支
   ```bash
   git checkout develop
   git pull
   git checkout -b bugfix/bug-name
   ```

2. **修复Bug**：修复问题

3. **运行测试**：确保修复有效
   ```bash
   npm test
   ```

4. **提交代码**：
   ```bash
   git add .
   git commit -m "fix(bug-name): 描述修复内容"
   git push origin bugfix/bug-name
   ```

5. **创建PR**：提交Pull Request到develop分支

6. **代码评审**：团队成员评审代码

7. **合并分支**：评审通过后合并到develop分支

### 4.3 版本发布

1. **更新版本**：更新package.json中的版本号

2. **运行构建**：
   ```bash
   npm run build
   ```

3. **运行测试**：确保所有测试通过
   ```bash
   npm test
   ```

4. **提交代码**：
   ```bash
   git add .
   git commit -m "chore: 版本发布 v1.0.0"
   git push origin develop
   ```

5. **合并到main**：将develop分支合并到main分支
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

6. **创建标签**：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 5. 测试指南

### 5.1 测试类型

- **单元测试**：测试单个功能模块
- **集成测试**：测试模块间的交互
- **端到端测试**：测试完整的业务流程

### 5.2 测试工具

- **Jest**：JavaScript测试框架
- **Vue Test Utils**：Vue组件测试
- **React Testing Library**：React组件测试
- **Supertest**：API测试

### 5.3 运行测试

```bash
# 运行所有测试
npm test

# 运行API测试
npm run test:api

# 运行前端测试
npm run test:frontend

# 运行管理后台测试
npm run test:admin
```

## 6. 代码评审

### 6.1 评审流程

1. **创建PR**：提交Pull Request
2. **分配评审**：指定评审人员
3. **代码评审**：评审人员检查代码
4. **反馈修改**：评审人员提出修改建议
5. **修改代码**：开发者根据建议修改
6. **重新评审**：评审人员再次检查
7. **合并代码**：评审通过后合并

### 6.2 评审重点

- **代码质量**：代码是否清晰、可维护
- **功能正确性**：功能是否符合需求
- **性能优化**：代码是否高效
- **安全性**：是否存在安全问题
- **测试覆盖**：测试是否充分
- **代码风格**：是否符合规范

## 7. 调试指南

### 7.1 前端调试

- **浏览器调试**：使用Chrome DevTools
- **Vue DevTools**：Vue组件调试
- **React DevTools**：React组件调试
- **网络请求**：检查API请求和响应
- **状态管理**：检查Pinia或Redux状态

### 7.2 后端调试

- **控制台日志**：使用console.log
- **断点调试**：使用VS Code断点
- **API测试**：使用Postman或Insomnia
- **数据库调试**：检查数据库操作
- **错误处理**：检查错误日志

## 8. 性能优化

### 8.1 前端优化

- **代码分割**：使用动态导入
- **懒加载**：图片和组件懒加载
- **缓存策略**：合理使用缓存
- **减少请求**：合并API请求
- **压缩资源**：压缩CSS、JS、图片
- **优化渲染**：减少重排和重绘

### 8.2 后端优化

- **数据库优化**：使用索引、优化查询
- **缓存优化**：使用Redis缓存
- **代码优化**：优化算法和数据结构
- **并发处理**：使用异步处理
- **负载均衡**：使用负载均衡器

## 9. 安全开发

### 9.1 前端安全

- **XSS防护**：使用转义、Content-Security-Policy
- **CSRF防护**：使用CSRF token
- **输入验证**：前端表单验证
- **敏感信息**：不存储敏感信息
- **HTTPS**：使用HTTPS

### 9.2 后端安全

- **SQL注入防护**：使用参数化查询
- **认证授权**：使用JWT、RBAC
- **密码加密**：使用bcrypt等加密
- **API限流**：防止暴力攻击
- **日志记录**：记录关键操作
- **依赖安全**：定期更新依赖

## 10. 常见问题

### 10.1 依赖安装失败

- **清除缓存**：`npm cache clean --force`
- **使用yarn**：`yarn install`
- **检查网络**：确保网络连接正常
- **检查Node版本**：使用推荐的Node版本

### 10.2 启动失败

- **检查端口**：确保端口未被占用
- **检查环境变量**：确保配置正确
- **检查依赖**：确保依赖安装完整
- **检查日志**：查看错误日志

### 10.3 测试失败

- **检查代码**：确保代码逻辑正确
- **检查测试用例**：确保测试用例正确
- **检查环境**：确保测试环境配置正确
- **检查依赖**：确保依赖版本正确

### 10.4 构建失败

- **检查代码**：确保代码无语法错误
- **检查配置**：确保构建配置正确
- **检查依赖**：确保依赖版本正确
- **检查资源**：确保资源文件存在

## 11. 最佳实践

### 11.1 代码组织

- **模块化**：将代码拆分为小模块
- **单一职责**：每个函数只做一件事
- **代码复用**：抽取公共代码
- **文档注释**：为复杂代码添加注释

### 11.2 性能优化

- **使用缓存**：合理使用缓存
- **减少请求**：合并API请求
- **优化算法**：使用高效算法
- **懒加载**：延迟加载非关键资源

### 11.3 安全实践

- **输入验证**：验证所有用户输入
- **密码加密**：使用安全的加密算法
- **权限控制**：严格的权限检查
- **日志记录**：记录关键操作

### 11.4 团队协作

- **代码评审**：定期进行代码评审
- **文档更新**：及时更新文档
- **知识分享**：分享技术知识
- **规范遵循**：遵循团队规范

## 12. 总结

本开发指南提供了MIXMLAAL项目的开发流程和规范，旨在帮助开发团队提高开发效率，保证代码质量，确保项目的可维护性和可扩展性。

遵循本指南的规范和最佳实践，将有助于开发团队更好地协作，开发出高质量的应用。

---

**文档版本**：1.0.0
**最后更新**：2026-04-25
