/**
 * 配送调度路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();

router.post('/optimize', async (req, res) => {
  try {
    const { orders } = req.body;

    const optimizedRoutes = optimizeDeliveryRoutes(orders);

    res.json({
      status: 'success',
      data: {
        route_id: `ROUTE${Date.now()}`,
        routes: optimizedRoutes,
        total_distance: calculateTotalDistance(optimizedRoutes),
        estimated_time: calculateEstimatedTime(optimizedRoutes),
      },
    });
  } catch (error) {
    console.error('优化配送路线错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/result/:id', async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      status: 'success',
      data: {
        route_id: id,
        status: 'completed',
        routes: [],
        total_distance: 0,
        estimated_time: 0,
      },
    });
  } catch (error) {
    console.error('获取配送结果错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/routes', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    res.json({
      status: 'success',
      data: {
        routes: [],
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: 0,
        },
      },
    });
  } catch (error) {
    console.error('获取配送路线列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

function optimizeDeliveryRoutes(orders) {
  if (!orders || orders.length === 0) {
    return [];
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return new Date(a.deadline) - new Date(b.deadline);
  });

  const routes = [];
  let currentRoute = [];
  let currentDistance = 0;
  const maxDistancePerRoute = 10000;

  for (const order of sortedOrders) {
    if (currentDistance + (order.distance || 0) > maxDistancePerRoute) {
      if (currentRoute.length > 0) {
        routes.push({
          orders: currentRoute,
          total_distance: currentDistance,
        });
      }
      currentRoute = [order];
      currentDistance = order.distance || 0;
    } else {
      currentRoute.push(order);
      currentDistance += order.distance || 0;
    }
  }

  if (currentRoute.length > 0) {
    routes.push({
      orders: currentRoute,
      total_distance: currentDistance,
    });
  }

  return routes;
}

function calculateTotalDistance(routes) {
  return routes.reduce((sum, route) => sum + route.total_distance, 0);
}

function calculateEstimatedTime(routes) {
  const totalDistance = calculateTotalDistance(routes);
  const avgSpeed = 30;
  return Math.round(totalDistance / 1000 / avgSpeed * 60);
}

module.exports = router;