const { Address } = require('../models');
const mapService = require('../services/mapService');
const fileService = require('../services/fileService');
const cache = require('../config/redis');

// 地址控制器
class AddressController {
  // 获取地址列表
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status = 'valid' } = req.query;
      
      // 生成缓存键
      const cacheKey = `addresses:${userId}:${page}:${pageSize}:${status}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const where = { userId };
      if (status) {
        where.status = status;
      }
      
      const { count, rows } = await Address.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
      
      const responseData = {
        code: 200,
        message: '获取地址列表成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 300);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取地址列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取地址列表失败',
        data: null
      });
    }
  }

  // 获取地址详情
  async getAddressById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // 生成缓存键
      const cacheKey = `address:${id}:${userId}`;
      
      // 尝试从缓存获取
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const address = await Address.findOne({
        where: { id, userId }
      });
      
      if (!address) {
        return res.json({
          code: 404,
          message: '地址不存在',
          data: null
        });
      }
      
      const responseData = {
        code: 200,
        message: '获取地址详情成功',
        data: address
      };
      
      // 缓存结果
      await cache.set(cacheKey, responseData, 600);
      
      res.json(responseData);
    } catch (error) {
      console.error('获取地址详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取地址详情失败',
        data: null
      });
    }
  }

  // 创建地址
  async createAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressData = req.body;
      
      // 地理编码
      if (addressData.address) {
        const geocodeResult = await mapService.geocode(addressData.address);
        if (geocodeResult) {
          addressData.latitude = geocodeResult.latitude;
          addressData.longitude = geocodeResult.longitude;
          addressData.province = geocodeResult.province;
          addressData.city = geocodeResult.city;
          addressData.district = geocodeResult.district;
        }
      }
      
      // 如果设置为默认地址，将其他地址设置为非默认
      if (addressData.isDefault) {
        await Address.update({ isDefault: false }, {
          where: { userId, isDefault: true }
        });
      }
      
      const address = await Address.create({
        ...addressData,
        userId
      });
      
      // 清除缓存
      await cache.delPattern(`addresses:${userId}:*`);
      
      res.json({
        code: 200,
        message: '创建地址成功',
        data: address
      });
    } catch (error) {
      console.error('创建地址失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建地址失败',
        data: null
      });
    }
  }

  // 更新地址
  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const addressData = req.body;
      
      const address = await Address.findOne({
        where: { id, userId }
      });
      
      if (!address) {
        return res.json({
          code: 404,
          message: '地址不存在',
          data: null
        });
      }
      
      // 地理编码
      if (addressData.address && addressData.address !== address.address) {
        const geocodeResult = await mapService.geocode(addressData.address);
        if (geocodeResult) {
          addressData.latitude = geocodeResult.latitude;
          addressData.longitude = geocodeResult.longitude;
          addressData.province = geocodeResult.province;
          addressData.city = geocodeResult.city;
          addressData.district = geocodeResult.district;
        }
      }
      
      // 如果设置为默认地址，将其他地址设置为非默认
      if (addressData.isDefault) {
        await Address.update({ isDefault: false }, {
          where: { userId, isDefault: true, id: { [Op.ne]: id } }
        });
      }
      
      await address.update(addressData);
      
      // 清除缓存
      await cache.delPattern(`addresses:${userId}:*`);
      await cache.del(`address:${id}:${userId}`);
      
      res.json({
        code: 200,
        message: '更新地址成功',
        data: address
      });
    } catch (error) {
      console.error('更新地址失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新地址失败',
        data: null
      });
    }
  }

  // 删除地址
  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const address = await Address.findOne({
        where: { id, userId }
      });
      
      if (!address) {
        return res.json({
          code: 404,
          message: '地址不存在',
          data: null
        });
      }
      
      await address.destroy();
      
      // 清除缓存
      await cache.delPattern(`addresses:${userId}:*`);
      await cache.del(`address:${id}:${userId}`);
      
      res.json({
        code: 200,
        message: '删除地址成功',
        data: null
      });
    } catch (error) {
      console.error('删除地址失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除地址失败',
        data: null
      });
    }
  }

  // 批量导入地址
  async importAddresses(req, res) {
    try {
      const userId = req.user.id;
      
      // 检查是否有文件上传
      if (!req.file) {
        return res.json({
          code: 400,
          message: '请上传文件',
          data: null
        });
      }
      
      // 解析文件
      const data = fileService.parseFile(req.file.path);
      
      // 验证地址数据
      const validationResult = fileService.validateAddressData(data);
      
      // 处理有效数据
      const validAddresses = [];
      for (const item of validationResult.valid) {
        // 地理编码
        const geocodeResult = await mapService.geocode(item.address);
        
        const address = await Address.create({
          userId,
          name: item.name,
          phone: item.phone,
          address: item.address,
          province: geocodeResult ? geocodeResult.province : '',
          city: geocodeResult ? geocodeResult.city : '',
          district: geocodeResult ? geocodeResult.district : '',
          latitude: geocodeResult ? geocodeResult.latitude : null,
          longitude: geocodeResult ? geocodeResult.longitude : null,
          priority: item.priority,
          deliveryTime: item.deliveryTime,
          notes: item.notes
        });
        
        validAddresses.push(address);
      }
      
      // 清理临时文件
      fileService.cleanup(req.file.path);
      
      // 清除缓存
      await cache.delPattern(`addresses:${userId}:*`);
      
      res.json({
        code: 200,
        message: '批量导入地址成功',
        data: {
          validCount: validAddresses.length,
          invalidCount: validationResult.invalid.length,
          validAddresses: validAddresses,
          invalidAddresses: validationResult.invalid
        }
      });
    } catch (error) {
      console.error('批量导入地址失败:', error);
      
      // 清理临时文件
      if (req.file) {
        fileService.cleanup(req.file.path);
      }
      
      res.status(500).json({
        code: 500,
        message: '批量导入地址失败',
        data: null
      });
    }
  }

  // 下载地址模板
  async downloadTemplate(req, res) {
    try {
      const templatePath = fileService.generateTemplate();
      
      res.download(templatePath, 'address-template.xlsx', (error) => {
        if (error) {
          console.error('下载模板失败:', error);
          res.status(500).json({
            code: 500,
            message: '下载模板失败',
            data: null
          });
        }
        
        // 清理临时文件
        fileService.cleanup(templatePath);
      });
    } catch (error) {
      console.error('生成模板失败:', error);
      res.status(500).json({
        code: 500,
        message: '生成模板失败',
        data: null
      });
    }
  }
}

module.exports = new AddressController();