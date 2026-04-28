const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/kafka-producer.log' })
  ]
});

const kafka = new Kafka({
  clientId: 'mixmlaal-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();

const TOPICS = {
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_COMPLETED: 'order.completed',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  USER_REGISTERED: 'user.registered',
  USER_AUTHENTICATED: 'user.authenticated',
  DRIVER_LOCATION: 'driver.location',
  RIDER_LOCATION: 'rider.location',
  USER_BEHAVIOR: 'user.behavior'
};

function createEvent(topic, data) {
  return {
    event_id: uuidv4(),
    event_type: topic,
    timestamp: Date.now(),
    data
  };
}

async function sendMessage(topic, data) {
  try {
    await producer.send({
      topic,
      messages: [
        { key: String(data.order_id || data.user_id || uuidv4()), value: JSON.stringify(createEvent(topic, data)) }
      ]
    });
    logger.info(`Message sent to ${topic}:`, data);
    return true;
  } catch (error) {
    logger.error(`Failed to send message to ${topic}:`, error);
    return false;
  }
}

async function sendOrderCreated(orderData) {
  return sendMessage(TOPICS.ORDER_CREATED, orderData);
}

async function sendOrderPaid(orderData) {
  return sendMessage(TOPICS.ORDER_PAID, orderData);
}

async function sendOrderCompleted(orderData) {
  return sendMessage(TOPICS.ORDER_COMPLETED, orderData);
}

async function sendOrderCancelled(orderData) {
  return sendMessage(TOPICS.ORDER_CANCELLED, orderData);
}

async function sendPaymentSucceeded(paymentData) {
  return sendMessage(TOPICS.PAYMENT_SUCCEEDED, paymentData);
}

async function sendPaymentFailed(paymentData) {
  return sendMessage(TOPICS.PAYMENT_FAILED, paymentData);
}

async function sendPaymentRefunded(refundData) {
  return sendMessage(TOPICS.PAYMENT_REFUNDED, refundData);
}

async function sendUserRegistered(userData) {
  return sendMessage(TOPICS.USER_REGISTERED, userData);
}

async function sendUserAuthenticated(authData) {
  return sendMessage(TOPICS.USER_AUTHENTICATED, authData);
}

async function sendDriverLocation(locationData) {
  return sendMessage(TOPICS.DRIVER_LOCATION, locationData);
}

async function sendRiderLocation(locationData) {
  return sendMessage(TOPICS.RIDER_LOCATION, locationData);
}

async function sendUserBehavior(behaviorData) {
  return sendMessage(TOPICS.USER_BEHAVIOR, behaviorData);
}

async function startProducer() {
  await producer.connect();
  logger.info('Kafka producer connected');
  logger.info('Kafka producer started successfully');
}

async function shutdown() {
  logger.info('Shutting down producer...');
  await producer.disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startProducer().catch(error => {
  logger.error('Failed to start producer:', error);
  process.exit(1);
});

module.exports = {
  producer,
  TOPICS,
  sendMessage,
  sendOrderCreated,
  sendOrderPaid,
  sendOrderCompleted,
  sendOrderCancelled,
  sendPaymentSucceeded,
  sendPaymentFailed,
  sendPaymentRefunded,
  sendUserRegistered,
  sendUserAuthenticated,
  sendDriverLocation,
  sendRiderLocation,
  sendUserBehavior
};