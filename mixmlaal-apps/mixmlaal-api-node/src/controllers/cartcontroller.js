const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 获取购物车
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.json({ success: true, data: { items: [], total: 0 } });
    }
    
    // 计算总金额
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    res.json({ success: true, data: { ...cart._doc, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 添加商品到购物车
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // 检查商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: '库存不足' });
    }
    
    // 查找或创建购物车
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    // 检查商品是否已在购物车中
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      // 更新数量
      existingItem.quantity += quantity;
      // 检查库存
      if (existingItem.quantity > product.stock) {
        return res.status(400).json({ success: false, message: '库存不足' });
      }
    } else {
      // 添加新商品
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    
    // 重新获取购物车数据
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    res.json({ success: true, data: { ...updatedCart._doc, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新购物车商品数量
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: '数量必须大于0' });
    }
    
    // 检查商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: '库存不足' });
    }
    
    // 查找购物车
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: '购物车不存在' });
    }
    
    // 查找商品
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: '商品不在购物车中' });
    }
    
    // 更新数量
    existingItem.quantity = quantity;
    await cart.save();
    
    // 重新获取购物车数据
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    res.json({ success: true, data: { ...updatedCart._doc, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 从购物车移除商品
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // 查找购物车
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: '购物车不存在' });
    }
    
    // 移除商品
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    
    // 重新获取购物车数据
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    res.json({ success: true, data: { ...updatedCart._doc, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 清空购物车
exports.clearCart = async (req, res) => {
  try {
    // 查找购物车
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: '购物车不存在' });
    }
    
    // 清空购物车
    cart.items = [];
    await cart.save();
    
    res.json({ success: true, data: { ...cart._doc, total: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};