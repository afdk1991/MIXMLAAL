const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

class ShopController {
  // 商品相关方法
  async getProducts(req, res) {
    try {
      const products = await Product.findAll();
      res.status(200).json({
        code: 200,
        message: 'success',
        data: products
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取商品失败'
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          code: 404,
          message: '商品不存在'
        });
      }
      res.status(200).json({
        code: 200,
        message: 'success',
        data: product
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取商品失败'
      });
    }
  }

  async createProduct(req, res) {
    try {
      const result = await Product.create(req.body);
      const product = await Product.findById(result.insertId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: product
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '创建商品失败'
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          code: 404,
          message: '商品不存在'
        });
      }
      await product.update(req.body);
      const updatedProduct = await Product.findById(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: updatedProduct
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新商品失败'
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          code: 404,
          message: '商品不存在'
        });
      }
      await product.delete();
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除商品失败'
      });
    }
  }

  // 分类相关方法
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.status(200).json({
        code: 200,
        message: 'success',
        data: categories
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取分类失败'
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在'
        });
      }
      res.status(200).json({
        code: 200,
        message: 'success',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取分类失败'
      });
    }
  }

  async createCategory(req, res) {
    try {
      const result = await Category.create(req.body);
      const category = await Category.findById(result.insertId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '创建分类失败'
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在'
        });
      }
      await category.update(req.body);
      const updatedCategory = await Category.findById(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: updatedCategory
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新分类失败'
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在'
        });
      }
      await category.delete();
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除分类失败'
      });
    }
  }

  // 订单相关方法
  async getOrders(req, res) {
    try {
      const { id: userId } = req.user;
      const orders = await Order.findByUserId(userId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: orders
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取订单失败'
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const order = await Order.findById(id);
      if (!order || order.user_id !== userId) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      const orderItems = await OrderItem.findByOrderId(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          ...order,
          items: orderItems
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取订单失败'
      });
    }
  }

  async createOrder(req, res) {
    try {
      const { id: userId } = req.user;
      const { items, shipping_address, payment_method } = req.body;
      
      // 计算总金额
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(404).json({
            code: 404,
            message: `商品 ${item.product_id} 不存在`
          });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            code: 400,
            message: `商品 ${product.name} 库存不足`
          });
        }
        totalAmount += product.price * item.quantity;
      }
      
      // 创建订单
      const orderResult = await Order.create({
        user_id: userId,
        total_amount: totalAmount,
        shipping_address,
        payment_method
      });
      
      const orderId = orderResult.insertId;
      
      // 创建订单项
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        await OrderItem.create({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        });
        // 更新商品库存
        await product.update({ stock: product.stock - item.quantity });
      }
      
      const order = await Order.findById(orderId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '创建订单失败'
      });
    }
  }

  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const order = await Order.findById(id);
      if (!order || order.user_id !== userId) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      await order.update(req.body);
      const updatedOrder = await Order.findById(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: updatedOrder
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新订单失败'
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const order = await Order.findById(id);
      if (!order || order.user_id !== userId) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      // 删除订单项
      await OrderItem.deleteByOrderId(id);
      // 删除订单
      await order.delete();
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除订单失败'
      });
    }
  }

  // 购物车相关方法
  async getCart(req, res) {
    try {
      // 这里可以实现购物车逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: []
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取购物车失败'
      });
    }
  }

  async addToCart(req, res) {
    try {
      // 这里可以实现添加到购物车的逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          id: 1,
          ...req.body
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '添加到购物车失败'
      });
    }
  }

  async updateCartItem(req, res) {
    try {
      // 这里可以实现更新购物车项的逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          id: req.params.id,
          ...req.body
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新购物车项失败'
      });
    }
  }

  async removeFromCart(req, res) {
    try {
      // 这里可以实现从购物车移除的逻辑，暂时返回成功
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '从购物车移除失败'
      });
    }
  }
}

module.exports = new ShopController();