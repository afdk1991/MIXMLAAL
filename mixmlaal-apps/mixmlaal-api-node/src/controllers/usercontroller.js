const userService = require('../services/userService');

class UserController {
  // 获取用户资料
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getProfile(userId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取用户资料失败'
      });
    }
  }
  
  // 更新用户资料
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;
      const user = await userService.updateProfile(userId, data);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新用户资料失败'
      });
    }
  }
  
  // 修改密码
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { old_password, new_password } = req.body;
      await userService.changePassword(userId, old_password, new_password);
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '修改密码失败'
      });
    }
  }
  
  // 获取地址列表
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await userService.getAddresses(userId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: { addresses }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取地址列表失败'
      });
    }
  }
  
  // 添加地址
  async addAddress(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;
      const address = await userService.addAddress(userId, data);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: { address }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '添加地址失败'
      });
    }
  }
  
  // 更新地址
  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      const data = req.body;
      const address = await userService.updateAddress(userId, addressId, data);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: { address }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新地址失败'
      });
    }
  }
  
  // 删除地址
  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      await userService.deleteAddress(userId, addressId);
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除地址失败'
      });
    }
  }
  
  // 设置默认地址
  async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
      await userService.setDefaultAddress(userId, addressId);
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '设置默认地址失败'
      });
    }
  }
}

module.exports = new UserController();
