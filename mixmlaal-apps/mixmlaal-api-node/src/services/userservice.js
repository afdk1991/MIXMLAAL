const User = require('../models/User');

class UserService {
  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户未找到');
    }
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      thirdPartyProvider: user.thirdPartyProvider,
      createdAt: user.createdAt
    };
  }

  async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户未找到');
    }

    const allowedUpdates = ['name', 'phone', 'avatar', 'username'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        filteredUpdates[key] = data[key];
      }
    }

    await user.update(filteredUpdates);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      thirdPartyProvider: user.thirdPartyProvider,
      createdAt: user.createdAt
    };
  }

  async getUserAddresses(userId) {
    return [];
  }

  async addUserAddress(userId, addressData) {
    return { id: 1, ...addressData, userId };
  }

  async updateUserAddress(userId, addressId, data) {
    return { id: addressId, ...data };
  }

  async deleteUserAddress(userId, addressId) {
    return { message: '删除成功' };
  }

  async setDefaultAddress(userId, addressId) {
    return { message: '设置成功' };
  }
}

module.exports = new UserService();