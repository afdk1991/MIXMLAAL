const request = require('supertest')
const app = require('../src/app')
const { Menu } = require('../src/models')

// 测试菜单管理功能
describe('菜单管理功能测试', () => {
  let token

  // 测试前准备：注册并登录获取token
  beforeAll(async () => {
    // 注册用户
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'menutestuser',
        email: 'menu@example.com',
        password: 'password123'
      })
    
    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'menu@example.com',
        password: 'password123'
      })
    
    token = loginResponse.body.data.access_token
  })

  // 测试获取菜单列表
  describe('GET /api/v1/menus', () => {
    test('应该成功获取菜单列表', async () => {
      const response = await request(app)
        .get('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('获取菜单列表成功')
      expect(response.body.data).toHaveProperty('list')
      expect(response.body.data).toHaveProperty('total')
    })
  })

  // 测试获取菜单树
  describe('GET /api/v1/menus/tree', () => {
    test('应该成功获取菜单树', async () => {
      const response = await request(app)
        .get('/api/v1/menus/tree')
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('获取菜单树成功')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  // 测试创建菜单
  describe('POST /api/v1/menus', () => {
    test('应该成功创建菜单', async () => {
      const response = await request(app)
        .post('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '测试菜单',
          code: 'test_menu',
          path: '/test',
          icon: 'Menu',
          parent_id: null,
          sort: 0,
          status: 'active'
        })
      
      expect(response.statusCode).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('创建菜单成功')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.name).toBe('测试菜单')
      expect(response.body.data.code).toBe('test_menu')
    })

    test('应该返回400错误，当菜单编码已存在时', async () => {
      // 先创建一个菜单
      await request(app)
        .post('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '已存在菜单',
          code: 'existing_menu',
          path: '/existing',
          parent_id: null,
          sort: 0,
          status: 'active'
        })
      
      // 再次使用相同的编码创建菜单
      const response = await request(app)
        .post('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '重复菜单',
          code: 'existing_menu',
          path: '/duplicate',
          parent_id: null,
          sort: 0,
          status: 'active'
        })
      
      expect(response.statusCode).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('菜单编码已存在')
    })
  })

  // 测试更新菜单
  describe('PUT /api/v1/menus/:id', () => {
    test('应该成功更新菜单', async () => {
      // 先创建一个菜单
      const createResponse = await request(app)
        .post('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '更新前菜单',
          code: 'update_menu',
          path: '/update',
          parent_id: null,
          sort: 0,
          status: 'active'
        })
      
      const menuId = createResponse.body.data.id
      
      // 更新菜单
      const response = await request(app)
        .put(`/api/v1/menus/${menuId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '更新后菜单',
          code: 'update_menu',
          path: '/updated',
          parent_id: null,
          sort: 1,
          status: 'active'
        })
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('更新菜单成功')
      expect(response.body.data.name).toBe('更新后菜单')
      expect(response.body.data.path).toBe('/updated')
      expect(response.body.data.sort).toBe(1)
    })

    test('应该返回404错误，当菜单不存在时', async () => {
      const response = await request(app)
        .put('/api/v1/menus/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '测试菜单',
          code: 'test_menu',
          path: '/test',
          parent_id: null,
          sort: 0,
          status: 'active'
        })
      
      expect(response.statusCode).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('菜单不存在')
    })
  })

  // 测试删除菜单
  describe('DELETE /api/v1/menus/:id', () => {
    test('应该成功删除菜单', async () => {
      // 先创建一个菜单
      const createResponse = await request(app)
        .post('/api/v1/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '删除菜单',
          code: 'delete_menu',
          path: '/delete',
          parent_id: null,
          sort: 0,
          status: 'active'
        })
      
      const menuId = createResponse.body.data.id
      
      // 删除菜单
      const response = await request(app)
        .delete(`/api/v1/menus/${menuId}`)
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('删除菜单成功')
    })

    test('应该返回404错误，当菜单不存在时', async () => {
      const response = await request(app)
        .delete('/api/v1/menus/999999')
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('菜单不存在')
    })
  })
})
