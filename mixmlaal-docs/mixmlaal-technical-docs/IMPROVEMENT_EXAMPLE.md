# 架构改进示例 - 统一API设计和分层架构重构

## 1. 改进目标

通过重构项目管理模块，展示如何：
1. 实现统一的API设计
2. 建立清晰的分层架构
3. 提高代码的可维护性和可测试性

## 2. 当前问题分析

### 2.1 API设计不统一

当前的项目管理API存在以下问题：
- 响应格式不一致
- 错误处理方式不统一
- 缺乏统一的中间件处理

### 2.2 分层架构不清晰

- 业务逻辑混杂在路由处理函数中
- 数据访问逻辑直接在控制器中实现
- 缺乏服务层封装复杂业务逻辑

## 3. 改进方案

### 3.1 创建统一响应处理中间件

#### 3.1.1 创建响应处理中间件

```javascript
// middleware/responseHandler.js
class ApiResponse {
  static success(data, message = '操作成功', statusCode = 200) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      statusCode
    };
  }

  static error(message = '服务器内部错误', code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      timestamp: new Date().toISOString(),
      statusCode
    };
  }
}

const handleResponse = (req, res, next) => {
  res.success = (data, message, statusCode = 200) => {
    res.status(statusCode).json(ApiResponse.success(data, message, statusCode));
  };

  res.error = (message, code, statusCode = 500, details) => {
    res.status(statusCode).json(ApiResponse.error(message, code, statusCode, details));
  };

  next();
};

module.exports = { handleResponse, ApiResponse };
```

### 3.2 创建数据访问层

#### 3.2.1 创建项目Repository

```javascript
// repositories/projectRepository.js
const Project = require('../models/Project');
const Task = require('../models/Task');

class ProjectRepository {
  // 创建项目
  async create(projectData) {
    try {
      const project = new Project(projectData);
      return await project.save();
    } catch (error) {
      throw new Error(`创建项目失败: ${error.message}`);
    }
  }

  // 获取所有项目
  async findAll(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const projects = await Project.find(filters)
        .populate('owner', 'username email')
        .populate('teamMembers.user', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Project.countDocuments(filters);

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`获取项目列表失败: ${error.message}`);
    }
  }

  // 根据ID获取项目
  async findById(id) {
    try {
      const project = await Project.findById(id)
        .populate('owner', 'username email')
        .populate('teamMembers.user', 'username email');
      
      return project;
    } catch (error) {
      throw new Error(`获取项目失败: ${error.message}`);
    }
  }

  // 更新项目
  async updateById(id, updateData) {
    try {
      const project = await Project.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('owner', 'username email')
        .populate('teamMembers.user', 'username email');
      
      return project;
    } catch (error) {
      throw new Error(`更新项目失败: ${error.message}`);
    }
  }

  // 删除项目
  async deleteById(id) {
    try {
      const project = await Project.findByIdAndDelete(id);
      
      // 删除关联的任务
      await Task.deleteMany({ project: id });
      
      return project;
    } catch (error) {
      throw new Error(`删除项目失败: ${error.message}`);
    }
  }

  // 添加团队成员
  async addTeamMember(projectId, userId, role) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('项目未找到');
      }
      
      const added = project.addTeamMember(userId, role);
      
      if (added) {
        await project.save();
        return project;
      } else {
        throw new Error('用户已在团队中');
      }
    } catch (error) {
      throw new Error(`添加团队成员失败: ${error.message}`);
    }
  }
}

module.exports = new ProjectRepository();
```

### 3.3 创建服务层

#### 3.3.1 创建项目服务

```javascript
// services/projectService.js
const projectRepository = require('../repositories/projectRepository');
const userRepository = require('../repositories/userRepository');

class ProjectService {
  // 创建项目
  async createProject(projectData) {
    try {
      // 验证项目所有者是否存在
      const owner = await userRepository.findById(projectData.owner);
      if (!owner) {
        throw new Error('项目所有者不存在');
      }

      // 验证项目代码唯一性
      const existingProject = await projectRepository.findOne({ code: projectData.code });
      if (existingProject) {
        throw new Error('项目代码已存在');
      }

      // 创建项目
      const project = await projectRepository.create(projectData);
      return project;
    } catch (error) {
      throw new Error(`创建项目失败: ${error.message}`);
    }
  }

  // 获取项目列表
  async getProjects(filters = {}, options = {}) {
    try {
      return await projectRepository.findAll(filters, options);
    } catch (error) {
      throw new Error(`获取项目列表失败: ${error.message}`);
    }
  }

  // 获取项目详情
  async getProjectById(id) {
    try {
      const project = await projectRepository.findById(id);
      if (!project) {
        throw new Error('项目未找到');
      }
      return project;
    } catch (error) {
      throw new Error(`获取项目详情失败: ${error.message}`);
    }
  }

  // 更新项目
  async updateProject(id, updateData) {
    try {
      // 如果更新了所有者，验证用户是否存在
      if (updateData.owner) {
        const owner = await userRepository.findById(updateData.owner);
        if (!owner) {
          throw new Error('项目所有者不存在');
        }
      }

      const project = await projectRepository.updateById(id, updateData);
      if (!project) {
        throw new Error('项目未找到');
      }
      return project;
    } catch (error) {
      throw new Error(`更新项目失败: ${error.message}`);
    }
  }

  // 删除项目
  async deleteProject(id) {
    try {
      const project = await projectRepository.findById(id);
      if (!project) {
        throw new Error('项目未找到');
      }

      await projectRepository.deleteById(id);
      return { message: '项目删除成功' };
    } catch (error) {
      throw new Error(`删除项目失败: ${error.message}`);
    }
  }

  // 添加团队成员
  async addTeamMember(projectId, userId, role) {
    try {
      // 验证用户是否存在
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      const project = await projectRepository.addTeamMember(projectId, userId, role);
      return project;
    } catch (error) {
      throw new Error(`添加团队成员失败: ${error.message}`);
    }
  }

  // 计算项目进度
  async calculateProjectProgress(projectId) {
    try {
      const project = await projectRepository.findById(projectId);
      if (!project) {
        throw new Error('项目未找到');
      }

      const progress = project.calculateProgress();
      project.progress = progress;
      await project.save();

      return { progress };
    } catch (error) {
      throw new Error(`计算项目进度失败: ${error.message}`);
    }
  }
}

module.exports = new ProjectService();
```

### 3.4 重构控制器

#### 3.4.1 创建项目控制器

```javascript
// controllers/projectController.js
const projectService = require('../services/projectService');

class ProjectController {
  // 创建项目
  async createProject(req, res) {
    try {
      const project = await projectService.createProject(req.body);
      res.success(project, '项目创建成功', 201);
    } catch (error) {
      res.error(error.message, 'CREATE_PROJECT_ERROR', 400);
    }
  }

  // 获取所有项目
  async getProjects(req, res) {
    try {
      const { page, limit, ...filters } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
      
      const result = await projectService.getProjects(filters, options);
      res.success(result, '获取项目列表成功');
    } catch (error) {
      res.error(error.message, 'GET_PROJECTS_ERROR', 500);
    }
  }

  // 根据ID获取项目
  async getProjectById(req, res) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      res.success(project, '获取项目详情成功');
    } catch (error) {
      if (error.message === '项目未找到') {
        res.error(error.message, 'PROJECT_NOT_FOUND', 404);
      } else {
        res.error(error.message, 'GET_PROJECT_ERROR', 500);
      }
    }
  }

  // 更新项目
  async updateProject(req, res) {
    try {
      const project = await projectService.updateProject(req.params.id, req.body);
      res.success(project, '项目更新成功');
    } catch (error) {
      if (error.message === '项目未找到') {
        res.error(error.message, 'PROJECT_NOT_FOUND', 404);
      } else {
        res.error(error.message, 'UPDATE_PROJECT_ERROR', 400);
      }
    }
  }

  // 删除项目
  async deleteProject(req, res) {
    try {
      const result = await projectService.deleteProject(req.params.id);
      res.success(result, '项目删除成功');
    } catch (error) {
      if (error.message === '项目未找到') {
        res.error(error.message, 'PROJECT_NOT_FOUND', 404);
      } else {
        res.error(error.message, 'DELETE_PROJECT_ERROR', 500);
      }
    }
  }

  // 添加团队成员
  async addTeamMember(req, res) {
    try {
      const { userId, role } = req.body;
      const project = await projectService.addTeamMember(req.params.id, userId, role);
      res.success(project, '团队成员添加成功');
    } catch (error) {
      if (error.message === '项目未找到') {
        res.error(error.message, 'PROJECT_NOT_FOUND', 404);
      } else if (error.message === '用户不存在') {
        res.error(error.message, 'USER_NOT_FOUND', 404);
      } else {
        res.error(error.message, 'ADD_TEAM_MEMBER_ERROR', 400);
      }
    }
  }

  // 计算项目进度
  async calculateProgress(req, res) {
    try {
      const result = await projectService.calculateProjectProgress(req.params.id);
      res.success(result, '项目进度计算成功');
    } catch (error) {
      if (error.message === '项目未找到') {
        res.error(error.message, 'PROJECT_NOT_FOUND', 404);
      } else {
        res.error(error.message, 'CALCULATE_PROGRESS_ERROR', 500);
      }
    }
  }
}

module.exports = new ProjectController();
```

### 3.5 更新路由文件

#### 3.5.1 重构项目路由

```javascript
// routes/projects.js
const express = require('express');
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authenticate);

// 创建项目
router.post('/', projectController.createProject);

// 获取所有项目
router.get('/', projectController.getProjects);

// 根据ID获取项目
router.get('/:id', projectController.getProjectById);

// 更新项目
router.put('/:id', projectController.updateProject);

// 删除项目
router.delete('/:id', projectController.deleteProject);

// 添加团队成员
router.post('/:id/team', projectController.addTeamMember);

// 计算项目进度
router.post('/:id/calculate-progress', projectController.calculateProgress);

module.exports = router;
```

### 3.6 更新主服务文件

#### 3.6.1 集成新的中间件和路由

```javascript
// server.js (部分更新)
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 数据库连接
const connectDB = require('./config/db');

// 中间件
const { handleResponse } = require('./middleware/responseHandler');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3003;

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP在窗口期内最多100个请求
});

// 中间件
app.use(helmet()); // 安全头部
app.use(cors()); // 跨域支持
app.use(morgan('combined')); // 日志记录
app.use(compression()); // 压缩响应
app.use(limiter); // 速率限制
app.use(express.json({ limit: '10mb' })); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体
app.use(handleResponse); // 统一响应处理

// 静态文件服务
app.use(express.static('public'));

// 连接数据库
connectDB();

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/teams');
const portfolioRoutes = require('./routes/portfolios');
const programRoutes = require('./routes/programs');

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/programs', programRoutes);

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.success({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  }, '系统健康检查成功');
});

// 系统信息端点
app.get('/system-info', (req, res) => {
  res.success({
    name: 'Enterprise Project Management System',
    version: '2.0.0',
    description: '企业级大型项目管理系统',
    features: [
      '多项目组合管理',
      '复杂组织架构支持',
      '高级项目管理功能',
      '实时协作',
      '数据分析与报告',
      '安全权限控制'
    ]
  }, '获取系统信息成功');
});

// API文档路由
app.get('/api-docs', (req, res) => {
  res.success({
    message: '企业级大型项目管理系统 API 文档',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      tasks: '/api/tasks',
      teams: '/api/teams',
      portfolios: '/api/portfolios',
      programs: '/api/programs'
    }
  }, '获取API文档成功');
});

// 404处理
app.use((req, res) => {
  res.error('接口不存在', 'NOT_FOUND', 404);
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.error('服务器内部错误', 'INTERNAL_SERVER_ERROR', 500);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`企业级大型项目管理系统运行在端口 ${PORT}`);
  console.log(`版本: 2.0.0`);
});

module.exports = app;
```

## 4. 改进效果

### 4.1 代码结构更清晰
- 业务逻辑集中在服务层
- 数据访问封装在Repository层
- 控制器只负责请求处理和响应返回

### 4.2 API设计更统一
- 响应格式标准化
- 错误处理一致化
- 状态码使用规范化

### 4.3 可维护性提升
- 各层职责明确
- 代码复用性提高
- 便于单元测试

### 4.4 可扩展性增强
- 易于添加新功能
- 便于性能优化
- 支持微服务拆分

## 5. 实施建议

### 5.1 渐进式重构
1. 先重构项目管理模块作为示例
2. 逐步扩展到其他模块
3. 保持现有功能不受影响

### 5.2 测试保障
1. 编写单元测试覆盖服务层
2. 进行集成测试验证API
3. 进行性能测试确保质量

### 5.3 文档更新
1. 更新API文档
2. 编写开发规范
3. 提供重构说明

---
*示例创建时间: 2025年9月8日*