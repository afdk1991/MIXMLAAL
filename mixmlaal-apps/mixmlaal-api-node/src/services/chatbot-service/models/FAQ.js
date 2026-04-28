const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'chatbot_faqs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 自动同步表结构
FAQ.sync({ alter: true });

module.exports = FAQ;