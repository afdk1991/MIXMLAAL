const { Op } = require('sequelize')
const DeliveryOrder = require('../../models/配送/DeliveryOrder')
const DeliveryPerson = require('../../models/配送/DeliveryPerson')

// 创建配送订单
const createOrder = async (req, res) => {
  try {
    const {
      source_order_no,
      source_type,
      merchant_id,
      pickup_address,
      delivery_address,
      distance,
      delivery_type,
      weight,
      base_price,
      distance_price,
      weight_price,
      tips,
      total_price,
      actual_pay,
      is_urgent,
      urgent_fee,
      is_insurance,
      insurance_fee,
      is_cold_chain,
      goods_desc
    } = req.body

    const order_no = `DL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const pickup_code = Math.random().toString(36).substr(2, 6).toUpperCase()
    const delivery_code = Math.random().toString(36).substr(2, 6).toUpperCase()

    // 计算预计送达时间
    const estimated_delivery_time = new Date()
    estimated_delivery_time.setMinutes(estimated_delivery_time.getMinutes() + Math.ceil(distance * 3) + 15)

    const order = await DeliveryOrder.create({
      order_no,
      source_order_no,
      source_type,
      user_id: req.user.id,
      merchant_id,
      pickup_address,
      delivery_address,
      distance,
      estimated_delivery_time,
      delivery_type,
      weight,
      base_price,
      distance_price,
      weight_price,
      tips,
      total_price,
      actual_pay,
      is_urgent,
      urgent_fee,
      is_insurance,
      insurance_fee,
      is_cold_chain,
      goods_desc,
      pickup_code,
      delivery_code,
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      data: order,
      message: '创建配送订单成功'
    })
  } catch (error) {
    console.error('创建配送订单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '创建配送订单失败'
    })
  }
}

// 获取配送订单列表
const getOrderList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, status, delivery_type, is_urgent } = req.query
    
    const where = {}
    if (status) {
      where.status = status
    }
    if (delivery_type) {
      where.delivery_type = delivery_type
    }
    if (is_urgent !== undefined) {
      where.is_urgent = is_urgent === 'true'
    }

    const orders = await DeliveryOrder.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [['created_at', 'DESC']],
      include: [
        { 
          model: DeliveryPerson, 
          as: 'deliveryPerson', 
          attributes: ['id', 'real_name', 'phone', 'avatar', 'rating'] 
        }
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
      message: '获取配送订单列表成功'
    })
  } catch (error) {
    console.error('获取配送订单列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取配送订单列表失败'
    })
  }
}

// 获取配送订单详情
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params

    const order = await DeliveryOrder.findByPk(id, {
      include: [
        { model: DeliveryPerson, as: 'deliveryPerson' }
      ]
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送订单不存在'
      })
    }

    res.status(200).json({
      success: true,
      data: order,
      message: '获取配送订单详情成功'
    })
  } catch (error) {
    console.error('获取配送订单详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取配送订单详情失败'
    })
  }
}

// 取消配送订单
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const order = await DeliveryOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送订单不存在'
      })
    }

    if (!['pending', 'matched'].includes(order.status)) {
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
      message: '取消配送订单成功'
    })
  } catch (error) {
    console.error('取消配送订单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '取消配送订单失败'
    })
  }
}

// 确认取货
const confirmPickup = async (req, res) => {
  try {
    const { id } = req.params
    const { pickup_code } = req.body

    const order = await DeliveryOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送订单不存在'
      })
    }

    if (order.status !== 'picking') {
      return res.status(400).json({
        success: false,
        data: null,
        message: '当前状态无法确认取货'
      })
    }

    if (order.pickup_code !== pickup_code) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '取货码错误'
      })
    }

    await order.update({
      status: 'picked',
      actual_pickup_time: new Date()
    })

    res.status(200).json({
      success: true,
      data: order,
      message: '确认取货成功'
    })
  } catch (error) {
    console.error('确认取货失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '确认取货失败'
    })
  }
}

// 确认送达
const confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params
    const { delivery_code } = req.body

    const order = await DeliveryOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送订单不存在'
      })
    }

    if (order.status !== 'delivering') {
      return res.status(400).json({
        success: false,
        data: null,
        message: '当前状态无法确认送达'
      })
    }

    if (order.delivery_code !== delivery_code) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '送货码错误'
      })
    }

    await order.update({
      status: 'completed',
      actual_delivery_time: new Date()
    })

    res.status(200).json({
      success: true,
      data: order,
      message: '确认送达成功'
    })
  } catch (error) {
    console.error('确认送达失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '确认送达失败'
    })
  }
}

// 获取配送员位置
const getDeliveryPersonLocation = async (req, res) => {
  try {
    const { id } = req.params

    const order = await DeliveryOrder.findByPk(id, {
      include: [
        { model: DeliveryPerson, as: 'deliveryPerson' }
      ]
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送订单不存在'
      })
    }

    if (!order.deliveryPerson || !order.deliveryPerson.current_location) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送员位置不可用'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        location: order.deliveryPerson.current_location,
        delivery_person: {
          id: order.deliveryPerson.id,
          real_name: order.deliveryPerson.real_name,
          phone: order.deliveryPerson.phone,
          avatar: order.deliveryPerson.avatar
        }
      },
      message: '获取配送员位置成功'
    })
  } catch (error) {
    console.error('获取配送员位置失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取配送员位置失败'
    })
  }
}

// 评价配送
const rateDelivery = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body

    const order = await DeliveryOrder.findByPk(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配送订单不存在'
      })
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        data: null,
        message: '配送未完成，无法评价'
      })
    }

    await order.update({
      delivery_person_rating: rating,
      delivery_person_comment: comment
    })

    // 更新配送员评分
    if (order.delivery_person_id) {
      const deliveryPerson = await DeliveryPerson.findByPk(order.delivery_person_id)
      if (deliveryPerson) {
        const totalRating = deliveryPerson.rating * deliveryPerson.total_orders + rating
        const newRating = totalRating / (deliveryPerson.total_orders + 1)
        await deliveryPerson.update({
          rating: newRating,
          total_orders: deliveryPerson.total_orders + 1
        })
      }
    }

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

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  confirmPickup,
  confirmDelivery,
  getDeliveryPersonLocation,
  rateDelivery
}