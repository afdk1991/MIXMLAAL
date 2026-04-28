const request = require('supertest');
const app = require('../../src/server');

// 模拟认证中间件
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = {
      userId: 'USER_123',
      role: 'admin'
    };
    next();
  },
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, error: '没有权限' });
    }
  }
}));

// 模拟Permission和Role模型
jest.mock('../../src/models', () => ({
  Permission: {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Role: {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    setPermissions: jest.fn(),
    getPermissions: jest.fn()
  }
}));

const { Permission, Role } = require('../../src/models');

describe('Permission Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/permission/permissions', () => {
    it('should return permission list', async () => {
      const mockPermissions = [
        {
          id: 1,
          name: '用户管理',
          code: 'user:manage',
          description: '管理用户信息',
          category: '用户'
        },
        {
          id: 2,
          name: '订单管理',
          code: 'order:manage',
          description: '管理订单信息',
          category: '订单'
        }
      ];

      Permission.findAll.mockResolvedValue(mockPermissions);

      const response = await request(app).get('/api/v1/permission/permissions');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(Permission.findAll).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      Permission.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/v1/permission/permissions');

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('获取权限列表失败');
    });
  });

  describe('POST /api/v1/permission/permissions', () => {
    it('should create permission', async () => {
      const mockPermission = {
        id: 1,
        name: '内容管理',
        code: 'content:manage',
        description: '管理内容信息',
        category: '内容'
      };

      Permission.create.mockResolvedValue(mockPermission);

      const response = await request(app)
        .post('/api/v1/permission/permissions')
        .send({
          name: '内容管理',
          code: 'content:manage',
          description: '管理内容信息',
          category: '内容'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('内容管理');
      expect(Permission.create).toHaveBeenCalledWith({
        name: '内容管理',
        code: 'content:manage',
        description: '管理内容信息',
        category: '内容'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/permission/permissions')
        .send({
          name: '内容管理'
          // Missing code
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('权限名称和代码不能为空');
    });
  });

  describe('GET /api/v1/permission/roles', () => {
    it('should return role list', async () => {
      const mockRoles = [
        {
          id: 1,
          name: '超级管理员',
          code: 'super_admin',
          description: '拥有所有权限的超级管理员'
        },
        {
          id: 2,
          name: '管理员',
          code: 'admin',
          description: '拥有管理权限的管理员'
        }
      ];

      Role.findAll.mockResolvedValue(mockRoles);

      const response = await request(app).get('/api/v1/permission/roles');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(Role.findAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/permission/roles', () => {
    it('should create role', async () => {
      const mockRole = {
        id: 1,
        name: '编辑',
        code: 'editor',
        description: '拥有编辑权限的角色',
        setPermissions: jest.fn().mockResolvedValue({})
      };

      Role.create.mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/v1/permission/roles')
        .send({
          name: '编辑',
          code: 'editor',
          description: '拥有编辑权限的角色',
          permissions: [1, 2, 3]
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('编辑');
      expect(Role.create).toHaveBeenCalledWith({
        name: '编辑',
        code: 'editor',
        description: '拥有编辑权限的角色'
      });
      expect(mockRole.setPermissions).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  describe('POST /api/v1/permission/roles/:id/permissions', () => {
    it('should assign permissions to role', async () => {
      const mockRole = {
        id: 1,
        setPermissions: jest.fn().mockResolvedValue({})
      };

      Role.findByPk.mockResolvedValue(mockRole);

      const response = await request(app)
        .post('/api/v1/permission/roles/1/permissions')
        .send({
          permissions: [1, 2, 3]
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('权限分配成功');
      expect(mockRole.setPermissions).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should return 404 if role not found', async () => {
      Role.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/permission/roles/999/permissions')
        .send({
          permissions: [1, 2, 3]
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('角色不存在');
    });
  });
});
