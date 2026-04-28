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

// 模拟Content模型
jest.mock('../../src/models', () => ({
  Content: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

const { Content } = require('../../src/models');

describe('Content Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/content', () => {
    it('should return content list', async () => {
      const mockContents = {
        rows: [
          {
            id: 1,
            title: 'Test Content 1',
            content: 'Content 1',
            type: 'article',
            status: 'published',
            authorId: 'USER_123',
            createdAt: new Date()
          },
          {
            id: 2,
            title: 'Test Content 2',
            content: 'Content 2',
            type: 'article',
            status: 'published',
            authorId: 'USER_123',
            createdAt: new Date()
          }
        ],
        count: 2
      };

      Content.findAndCountAll.mockResolvedValue(mockContents);

      const response = await request(app).get('/api/v1/content');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contents).toHaveLength(2);
      expect(Content.findAndCountAll).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      Content.findAndCountAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/v1/content');

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('获取内容列表失败');
    });
  });

  describe('GET /api/v1/content/:id', () => {
    it('should return single content', async () => {
      const mockContent = {
        id: 1,
        title: 'Test Content',
        content: 'Content',
        type: 'article',
        status: 'published',
        authorId: 'USER_123',
        createdAt: new Date()
      };

      Content.findByPk.mockResolvedValue(mockContent);

      const response = await request(app).get('/api/v1/content/1');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(Content.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 404 if content not found', async () => {
      Content.findByPk.mockResolvedValue(null);

      const response = await request(app).get('/api/v1/content/999');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('内容不存在');
    });
  });

  describe('POST /api/v1/content', () => {
    it('should create content', async () => {
      const mockContent = {
        id: 1,
        title: 'New Content',
        content: 'Content',
        type: 'article',
        status: 'draft',
        authorId: 'USER_123',
        createdAt: new Date()
      };

      Content.create.mockResolvedValue(mockContent);

      const response = await request(app)
        .post('/api/v1/content')
        .send({
          title: 'New Content',
          content: 'Content',
          type: 'article'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Content');
      expect(Content.create).toHaveBeenCalledWith({
        title: 'New Content',
        content: 'Content',
        type: 'article',
        status: 'draft',
        authorId: 'USER_123',
        tags: undefined,
        metadata: undefined
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/content')
        .send({
          title: 'New Content'
          // Missing content and type
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('标题、内容和类型不能为空');
    });
  });

  describe('PUT /api/v1/content/:id', () => {
    it('should update content', async () => {
      const mockContent = {
        id: 1,
        title: 'Updated Content',
        content: 'Updated Content',
        type: 'article',
        status: 'published',
        authorId: 'USER_123',
        update: jest.fn().mockResolvedValue({})
      };

      Content.findByPk.mockResolvedValue(mockContent);

      const response = await request(app)
        .put('/api/v1/content/1')
        .send({
          title: 'Updated Content',
          content: 'Updated Content'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockContent.update).toHaveBeenCalledWith({
        title: 'Updated Content',
        content: 'Updated Content',
        type: 'article',
        status: 'published',
        tags: undefined,
        metadata: undefined
      });
    });

    it('should return 404 if content not found', async () => {
      Content.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/content/999')
        .send({
          title: 'Updated Content'
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('内容不存在');
    });
  });

  describe('DELETE /api/v1/content/:id', () => {
    it('should delete content', async () => {
      const mockContent = {
        id: 1,
        authorId: 'USER_123',
        destroy: jest.fn().mockResolvedValue({})
      };

      Content.findByPk.mockResolvedValue(mockContent);

      const response = await request(app).delete('/api/v1/content/1');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('内容删除成功');
      expect(mockContent.destroy).toHaveBeenCalled();
    });

    it('should return 404 if content not found', async () => {
      Content.findByPk.mockResolvedValue(null);

      const response = await request(app).delete('/api/v1/content/999');

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('内容不存在');
    });
  });
});
