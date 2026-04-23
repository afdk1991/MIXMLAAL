const { Op } = require('sequelize')
const TravelOrder = require('../../models/出行/Order')
const Driver = require('../../models/出行/Driver')
const Vehicle = require('../../models/出行/Vehicle')

// 创建出行订单
const createOrder = async (req, res) => {
  try {
    const {
      order_type,
      start_location,
      end_location,
      start_time,
      estimated_distance,
      estimated_duration,
      base_price,
      distance_price,
      time_price,
      total_price,
      discount_price,
      actual_price,
      passenger_count,
      is_insurance,
      insurance_amount,
      notes
    } = req.body

    const order_no = `TR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const order = await TravelOrder.create({
      order_no,
      user_id: req.user.id,
      order_type,
      start_location,
      end_location,
      start_time,
      estimated_distance,
      estimated_duration,
      base_price,
      distance_price,
      time_price,
      total_price,
      discount_price,
      actual_price,
      passenger_count,
      is_insurance,
      insurance_amount,
      notes,
      status: 'pending'
    })

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
    const { page = 1, page_size = 10, status, order_type, start_date, end_date } = req.query
    
    const where = {}
    if (status) {
      where.status = status
    }
    if (order_type) {
      where.order_type = order_type
    }
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      }
    }

    const orders = await TravelOrder.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [['created_at', 'DESC']],
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'real_name', 'phone', 'avatar', 'rating'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'vehicle_no', 'brand', 'model', 'color'] }
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

    const order = await TravelOrder.findByPk(id, {
      include: [
        { model: Driver, as: 'driver' },
        { model: Vehicle, as: 'vehicle' }
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

// 更新订单状态
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, driver_id, vehicle_id, cancel_reason } = req.body

    const order = await TravelOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '订单不存在'
      })
    }

    const updateData = { status }
    if (driver_id) {
      updateData.driver_id = driver_id
    }
    if (vehicle_id) {
      updateData.vehicle_id = vehicle_id
    }
    if (cancel_reason) {
      updateData.cancel_reason = cancel_reason
      updateData.cancel_time = new Date()
    }

    await order.update(updateData)

    res.status(200).json({
      success: true,
      data: order,
      message: '更新订单状态成功'
    })
  } catch (error) {
    console.error('更新订单状态失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '更新订单状态失败'
    })
  }
}

// 取消订单
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const order = await TravelOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '订单不存在'
      })
    }

    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '当前状态无法取消订单'
      })
    }

    await order.update({
      status: 'cancelled',
      cancel_reason: reason,
      cancel_time: new Date()
    })

    res.status(200).json({
      success: true,
      data: order,
      message: '取消订单成功'
    })
  } catch (error) {
    console.error('取消订单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '取消订单失败'
    })
  }
}

// 评价订单
const rateOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { driver_rating, user_rating, driver_comment, user_comment } = req.body

    const order = await TravelOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '订单不存在'
      })
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        data: null,
        message: '订单未完成，无法评价'
      })
    }

    const updateData = {}
    if (driver_rating) {
      updateData.driver_rating = driver_rating
    }
    if (user_rating) {
      updateData.user_rating = user_rating
    }
    if (driver_comment) {
      updateData.driver_comment = driver_comment
    }
    if (user_comment) {
      updateData.user_comment = user_comment
    }

    await order.update(updateData)

    res.status(200).json({
      success: true,
      data: order,
      message: '评价成功'
    })
  } catch (error) {
    console.error('评价失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '评价失败'
    })
  }
}

// 估算价格
const estimatePrice = async (req, res) => {
  try {
    const { order_type, distance, duration } = req.body

    // 基础价格配置
    const basePrices = {
      express: 8,      // 快车
      comfort: 12,      // 专车
      premium: 20,     // 豪轿
      carpool: 5,      // 拼车
      ridehailing: 10, // 网约车
      chauffeur: 50,   // 代驾
      rental: 100      // 租车
    }

    const distancePricePerKm = {
      express: 1.8,
      comfort: 2.5,
      premium: 4.0,
      carpool: 1.2,
      ridehailing: 2.0,
      chauffeur: 3.0,
      rental: 0
    }

    const timePricePerMin = {
      express: 0.3,
      comfort: 0.5,
      premium: 0.8,
      carpool: 0.2,
      ridehailing: 0.4,
      chauffeur: 0.5,
      rental: 0
    }

    const basePrice = basePrices[order_type] || 10
    const distancePrice = (distance || 0) * (distancePricePerKm[order_type] || 2)
    const timePrice = (duration || 0) * (timePricePerMin[order_type] || 0.3)
    const totalPrice = basePrice + distancePrice + timePrice

    res.status(200).json({
      success: true,
      data: {
        base_price: basePrice,
        distance_price: parseFloat(distancePrice.toFixed(2)),
        time_price: parseFloat(timePrice.toFixed(2)),
        total_price: parseFloat(totalPrice.toFixed(2))
      },
      message: '估算价格成功'
    })
  } catch (error) {
    console.error('估算价格失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '估算价格失败'
    })
  }
}

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
  rateOrder,
  estimatePrice
}