const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const User = require('../models/User');

class AdminController {
  // 商城管理方法
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

  async getOrders(req, res) {
    try {
      const orders = await Order.findAll();
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

  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      if (!order) {
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

  // 社交管理方法
  async getPosts(req, res) {
    try {
      const posts = await Post.findAll();
      res.status(200).json({
        code: 200,
        message: 'success',
        data: posts
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取动态失败'
      });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: '动态不存在'
        });
      }
      await post.update(req.body);
      const updatedPost = await Post.findById(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: updatedPost
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新动态失败'
      });
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          code: 404,
          message: '动态不存在'
        });
      }
      // 删除相关的评论
      await Comment.deleteByPostId(id);
      await post.delete();
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除动态失败'
      });
    }
  }

  async getComments(req, res) {
    try {
      const comments = await Comment.findAll();
      res.status(200).json({
        code: 200,
        message: 'success',
        data: comments
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取评论失败'
      });
    }
  }

  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({
          code: 404,
          message: '评论不存在'
        });
      }
      await comment.update(req.body);
      const updatedComment = await Comment.findById(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: updatedComment
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新评论失败'
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({
          code: 404,
          message: '评论不存在'
        });
      }
      const postId = comment.post_id;
      // 更新动态的评论数
      const post = await Post.findById(postId);
      if (post) {
        await post.decrementComments();
      }
      await comment.delete();
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除评论失败'
      });
    }
  }

  async getMessages(req, res) {
    try {
      const messages = await Message.findAll();
      res.status(200).json({
        code: 200,
        message: 'success',
        data: messages
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取消息失败'
      });
    }
  }

  // 企业管理方法
  async getEmployees(req, res) {
    try {
      const employees = await User.findAll();
      res.status(200).json({
        code: 200,
        message: 'success',
        data: employees
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取员工失败'
      });
    }
  }

  async createEmployee(req, res) {
    try {
      const result = await User.create({
        ...req.body,
        role: 'employee'
      });
      const employee = await User.findById(result.insertId);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: employee
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '创建员工失败'
      });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await User.findById(id);
      if (!employee) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在'
        });
      }
      await employee.update(req.body);
      const updatedEmployee = await User.findById(id);
      res.status(200).json({
        code: 200,
        message: 'success',
        data: updatedEmployee
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '更新员工失败'
      });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await User.findById(id);
      if (!employee) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在'
        });
      }
      await employee.delete();
      res.status(200).json({
        code: 200,
        message: 'success'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '删除员工失败'
      });
    }
  }

  async getAttendance(req, res) {
    try {
      // 这里可以实现考勤记录逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: []
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取考勤记录失败'
      });
    }
  }

  async createAttendance(req, res) {
    try {
      // 这里可以实现创建考勤记录的逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: req.body
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '创建考勤记录失败'
      });
    }
  }

  async getApprovals(req, res) {
    try {
      // 这里可以实现审批记录逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: []
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取审批记录失败'
      });
    }
  }

  async updateApproval(req, res) {
    try {
      // 这里可以实现更新审批状态的逻辑，暂时返回模拟数据
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
        message: error.message || '更新审批状态失败'
      });
    }
  }

  // 数据统计方法
  async getSalesStatistics(req, res) {
    try {
      // 这里可以实现销售数据统计逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          totalSales: 100000,
          orderCount: 500,
          productCount: 100,
          topProducts: []
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取销售统计失败'
      });
    }
  }

  async getCustomerStatistics(req, res) {
    try {
      // 这里可以实现客户数据统计逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          totalCustomers: 1000,
          activeCustomers: 500,
          newCustomers: 100,
          customerGrowth: 10
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取客户统计失败'
      });
    }
  }

  async getSocialStatistics(req, res) {
    try {
      // 这里可以实现社交数据统计逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          totalPosts: 500,
          totalComments: 1000,
          totalLikes: 5000,
          totalMessages: 2000
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取社交统计失败'
      });
    }
  }

  async getEmployeeStatistics(req, res) {
    try {
      // 这里可以实现员工数据统计逻辑，暂时返回模拟数据
      res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          totalEmployees: 50,
          attendanceRate: 95,
          averageSalary: 5000,
          departmentDistribution: []
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message || '获取员工统计失败'
      });
    }
  }
}

module.exports = new AdminController();