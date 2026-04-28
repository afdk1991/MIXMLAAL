/**
 * 统计路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();
const AnalyticsService = require('../../../../shared/services/analyticsservice');

let analyticsService;

const getAnalyticsService = () => {
  if (!analyticsService) {
    const db = require('../config/db');
    analyticsService = new AnalyticsService(db);
  }
  return analyticsService;
};

router.get('/overview', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const service = getAnalyticsService();
    const overview = await service.getOverview({ startDate: start_date, endDate: end_date });

    res.json({
      status: 'success',
      data: overview,
    });
  } catch (error) {
    console.error('获取概览统计错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/order-trend', async (req, res) => {
  try {
    const { period = 'day', start_date, end_date, limit = 30 } = req.query;
    const service = getAnalyticsService();
    const trend = await service.getOrderTrend({
      period,
      startDate: start_date,
      endDate: end_date,
      limit: parseInt(limit, 10),
    });

    res.json({
      status: 'success',
      data: trend,
    });
  } catch (error) {
    console.error('获取订单趋势错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/service-distribution', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const service = getAnalyticsService();
    const distribution = await service.getServiceDistribution({ startDate: start_date, endDate: end_date });

    res.json({
      status: 'success',
      data: distribution,
    });
  } catch (error) {
    console.error('获取服务分布错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/user-growth', async (req, res) => {
  try {
    const { period = 'day', start_date, end_date, limit = 30 } = req.query;
    const service = getAnalyticsService();
    const growth = await service.getUserGrowth({
      period,
      startDate: start_date,
      endDate: end_date,
      limit: parseInt(limit, 10),
    });

    res.json({
      status: 'success',
      data: growth,
    });
  } catch (error) {
    console.error('获取用户增长错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/sales-ranking', async (req, res) => {
  try {
    const { period = 'day', start_date, end_date, limit = 10 } = req.query;
    const service = getAnalyticsService();
    const ranking = await service.getSalesRanking({
      period,
      startDate: start_date,
      endDate: end_date,
      limit: parseInt(limit, 10),
    });

    res.json({
      status: 'success',
      data: ranking,
    });
  } catch (error) {
    console.error('获取销售排行错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;