const { Op } = require('sequelize')
const Shop = require('../../models/商城/Shop')
const Product = require('../../models/商城/Product')
const MallOrder = require('../../models/商城/MallOrder')
const Cart = require('../../models/商城/Cart')

// 获取店铺列表
const getShopList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, keyword, shop_type, city, status } = req.query
    
    const where = {}
    if (keyword) {
      where.shop_name = { [Op.like]: `%${keyword}%` }
    }
    if (shop_type) {
      where.shop_type = shop_type
    }
    if (city) {
      where.city = city
    }
    if (status) {
      where.status = status
    } else {
      where.status = 'active'
    }

    const shops = await Shop.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [['sort', 'ASC'], ['created_at', 'DESC']]
    })

    res.status(200).json({
      success: true,
      data: {
        list: shops.rows,
        total: shops.count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      },
      message: '获取店铺列表成功'
    })
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取店铺列表失败'
    })
  }
}

// 获取店铺详情
const getShopDetail = async (req, res) => {
  try {
    const { id } = req.params

    const shop = await Shop.findByPk(id)

    if (!shop) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '店铺不存在'
      })
    }

    res.status(200).json({
      success: true,
      data: shop,
      message: '获取店铺详情成功'
    })
  } catch (error) {
    console.error('获取店铺详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取店铺详情失败'
    })
  }
}

// 获取商品列表
const getProductList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, keyword, shop_id, category_id, is_on_sale, is_recommend, is_hot, sort } = req.query
    
    const where = {}
    if (keyword) {
      where.product_name = { [Op.like]: `%${keyword}%` }
    }
    if (shop_id) {
      where.shop_id = shop_id
    }
    if (category_id) {
      where.category_id = category_id
    }
    if (is_on_sale !== undefined) {
      where.is_on_sale = is_on_sale === 'true'
    }
    if (is_recommend !== undefined) {
      where.is_recommend = is_recommend === 'true'
    }
    if (is_hot !== undefined) {
      where.is_hot = is_hot === 'true'
    }
    where.status = 'active'

    let order = [['sort', 'ASC'], ['created_at', 'DESC']]
    if (sort === 'sales') {
      order = [['sales', 'DESC']]
    } else if (sort === 'price_asc') {
      order = [['price', 'ASC']]
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']]
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']]
    }

    const products = await Product.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order
    })

    res.status(200).json({
      success: true,
      data: {
        list: products.rows,
        total: products.count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      },
      message: '获取商品列表成功'
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取商品列表失败'
    })
  }
}

// 获取商品详情
const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findByPk(id, {
      include: [
        { model: Shop, as: 'shop' }
      ]
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '商品不存在'
      })
    }

    // 增加浏览数
    await product.increment('view_count')

    res.status(200).json({
      success: true,
      data: product,
      message: '获取商品详情成功'
    })
  } catch (error) {
    console.error('获取商品详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取商品详情失败'
    })
  }
}

// 添加商品到购物车
const addToCart = async (req, res) => {
  try {
    const { shop_id, product_id, sku_id, quantity, price, specifications } = req.body

    // 检查购物车中是否已存在该商品
    const existingCart = await Cart.findOne({
      where: {
        user_id: req.user.id,
        product_id,
        sku_id: sku_id || null,
        is_selected: true
      }
    })

    if (existingCart) {
      // 更新数量
      const newQuantity = existingCart.quantity + quantity
      const newTotalPrice = newQuantity * price
      await existingCart.update({
        quantity: newQuantity,
        total_price: newTotalPrice
      })
      return res.status(200).json({
        success: true,
        data: existingCart,
        message: '更新购物车成功'
      })
    }

    const cart = await Cart.create({
      user_id: req.user.id,
      shop_id,
      product_id,
      sku_id,
      quantity,
      price,
      total_price: quantity * price,
      specifications
    })

    res.status(201).json({
      success: true,
      data: cart,
      message: '添加购物车成功'
    })
  } catch (error) {
    console.error('添加购物车失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '添加购物车失败'
    })
  }
}

// 获取购物车列表
const getCartList = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      where: {
        user_id: req.user.id,
        is_selected: true
      },
      include: [
        { model: Product, as: 'product' },
        { model: Shop, as: 'shop' }
      ],
      order: [['created_at', 'DESC']]
    })

    // 按店铺分组
    const groupedCarts = {}
    carts.forEach(cart => {
      const shopId = cart.shop_id
      if (!groupedCarts[shopId]) {
        groupedCarts[shopId] = {
          shop: cart.shop,
          items: []
        }
      }
      groupedCarts[shopId].items.push(cart)
    })

    res.status(200).json({
      success: true,
      data: Object.values(groupedCarts),
      message: '获取购物车列表成功'
    })
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取购物车列表失败'
    })
  }
}

// 更新购物车商品数量
const updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    const cart = await Cart.findByPk(id)

    if (!cart) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '购物车商品不存在'
      })
    }

    if (quantity <= 0) {
      await cart.destroy()
      return res.status(200).json({
        success: true,
        data: null,
        message: '删除购物车商品成功'
      })
    }

    await cart.update({
      quantity,
      total_price: quantity * cart.price
    })

    res.status(200).json({
      success: true,
      data: cart,
      message: '更新购物车成功'
    })
  } catch (error) {
    console.error('更新购物车失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '更新购物车失败'
    })
  }
}

// 删除购物车商品
const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params

    const cart = await Cart.findByPk(id)

    if (!cart) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '购物车商品不存在'
      })
    }

    await cart.destroy()

    res.status(200).json({
      success: true,
      data: null,
      message: '删除购物车商品成功'
    })
  } catch (error) {
    console.error('删除购物车商品失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '删除购物车商品失败'
    })
  }
}

// 创建商城订单
const createOrder = async (req, res) => {
  try {
    const {
      shop_id,
      items,
      delivery_type,
      delivery_address,
      remark
    } = req.body

    const order_no = `ML${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // 计算订单金额
    let total_quantity = 0
    let total_amount = 0
    let cost_amount = 0

    items.forEach(item => {
      total_quantity += item.quantity
      total_amount += item.price * item.quantity
      if (item.cost) {
        cost_amount += item.cost * item.quantity
      }
    })

    // 获取配送信息
    const shop = await Shop.findByPk(shop_id)
    let freight_amount = shop ? shop.delivery_fee : 0
    if (delivery_type === 'pickup') {
      freight_amount = 0
    }

    const actual_amount = total_amount + freight_amount

    const order = await MallOrder.create({
      order_no,
      user_id: req.user.id,
      shop_id,
      total_quantity,
      total_amount,
      freight_amount,
      actual_amount,
      cost_amount,
      profit_amount: total_amount - cost_amount,
      delivery_type,
      delivery_address,
      remark,
      status: 'pending'
    })

    // 清除购物车中已下单的商品
    const cartIds = items.map(item => item.cart_id).filter(id => id)
    if (cartIds.length > 0) {
      await Cart.destroy({ where: { id: cartIds } })
    }

    res.status(201).json({
      success: true,
      data: order,
      message: '创建订单成功'
    })
  } catch (error) {
    console.error('创建订单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '创建订单失败'
    })
  }
}

// 获取订单列表
const getOrderList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, status } = req.query
    
    const where = { user_id: req.user.id }
    if (status) {
      where.status = status
    }

    const orders = await MallOrder.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [['created_at', 'DESC']],
      include: [
        { model: Shop, as: 'shop' }
      ]
    })

    res.status(200).json({
      success: true,
      data: {
        list: orders.rows,
        total: orders.count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      },
      message: '获取订单列表成功'
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取订单列表失败'
    })
  }
}

// 获取订单详情
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params

    const order = await MallOrder.findByPk(id, {
      include: [
        { model: Shop, as: 'shop' }
      ]
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '订单不存在'
      })
    }

    res.status(200).json({
      success: true,
      data: order,
      message: '获取订单详情成功'
    })
  } catch (error) {
    console.error('获取订单详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取订单详情失败'
    })
  }
}

module.exports = {
  getShopList,
  getShopDetail,
  getProductList,
  getProductDetail,
  addToCart,
  getCartList,
  updateCartQuantity,
  deleteCartItem,
  createOrder,
  getOrderList,
  getOrderDetail
}