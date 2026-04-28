const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/kafka-consumer.log' })
  ]
});

const kafka = new Kafka({
  clientId: 'mixmlaal-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const consumer = kafka.consumer({ groupId: 'mixmlaal-consumer-group' });

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

async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mixmlaal';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
  }
}

async function handleOrderCreated(data) {
  logger.info('Processing order created event:', data);
  try {
    await redis.set(`order:${data.order_id}`, JSON.stringify(data), 'EX', 3600);
    await redis.publish('order:new', JSON.stringify(data));
    logger.info(`Order ${data.order_id} processed successfully`);
  } catch (error) {
    logger.error('Failed to process order created:', error);
  }
}

async function handleOrderPaid(data) {
  logger.info('Processing order paid event:', data);
  try {
    await redis.set(`order:${data.order_id}:paid`, JSON.stringify(data), 'EX', 86400);
    await redis.publish('order:paid', JSON.stringify(data));
    logger.info(`Order ${data.order_id} payment processed`);
  } catch (error) {
    logger.error('Failed to process order paid:', error);
  }
}

async function handleOrderCompleted(data) {
  logger.info('Processing order completed event:', data);
  try {
    await redis.del(`order:${data.order_id}`);
    await redis.publish('order:completed', JSON.stringify(data));
    logger.info(`Order ${data.order_id} completed`);
  } catch (error) {
    logger.error('Failed to process order completed:', error);
  }
}

async function handleOrderCancelled(data) {
  logger.info('Processing order cancelled event:', data);
  try {
    await redis.del(`order:${data.order_id}`);
    await redis.publish('order:cancelled', JSON.stringify(data));
    logger.info(`Order ${data.order_id} cancelled`);
  } catch (error) {
    logger.error('Failed to process order cancelled:', error);
  }
}

async function handlePaymentSucceeded(data) {
  logger.info('Processing payment succeeded event:', data);
  try {
    await redis.set(`payment:${data.payment_id}`, JSON.stringify(data), 'EX', 86400);
    await redis.publish('payment:succeeded', JSON.stringify(data));
    logger.info(`Payment ${data.payment_id} processed`);
  } catch (error) {
    logger.error('Failed to process payment succeeded:', error);
  }
}

async function handlePaymentFailed(data) {
  logger.info('Processing payment failed event:', data);
  try {
    await redis.publish('payment:failed', JSON.stringify(data));
    logger.warn(`Payment ${data.payment_id} failed: ${data.reason}`);
  } catch (error) {
    logger.error('Failed to process payment failed:', error);
  }
}

async function handlePaymentRefunded(data) {
  logger.info('Processing payment refunded event:', data);
  try {
    await redis.del(`payment:${data.payment_id}`);
    await redis.publish('payment:refunded', JSON.stringify(data));
    logger.info(`Payment ${data.payment_id} refunded`);
  } catch (error) {
    logger.error('Failed to process payment refunded:', error);
  }
}

async function handleUserRegistered(data) {
  logger.info('Processing user registered event:', data);
  try {
    await redis.set(`user:${data.user_id}:registered`, JSON.stringify(data), 'EX', 86400);
    await redis.publish('user:registered', JSON.stringify(data));
    logger.info(`User ${data.user_id} registered`);
  } catch (error) {
    logger.error('Failed to process user registered:', error);
  }
}

async function handleUserAuthenticated(data) {
  logger.info('Processing user authenticated event:', data);
  try {
    await redis.set(`user:${data.user_id}:auth`, JSON.stringify(data), 'EX', 3600);
    logger.info(`User ${data.user_id} authenticated`);
  } catch (error) {
    logger.error('Failed to process user authenticated:', error);
  }
}

async function handleDriverLocation(data) {
  logger.info('Processing driver location event:', data);
  try {
    await redis.set(
      `driver:${data.driver_id}:location`,
      JSON.stringify({ lat: data.lat, lng: data.lng, timestamp: data.timestamp }),
      'EX', 300
    );
    await redis.publish('driver:location:updated', JSON.stringify(data));
  } catch (error) {
    logger.error('Failed to process driver location:', error);
  }
}

async function handleRiderLocation(data) {
  logger.info('Processing rider location event:', data);
  try {
    await redis.set(
      `rider:${data.rider_id}:location`,
      JSON.stringify({ lat: data.lat, lng: data.lng, timestamp: data.timestamp }),
      'EX', 300
    );
    await redis.publish('rider:location:updated', JSON.stringify(data));
  } catch (error) {
    logger.error('Failed to process rider location:', error);
  }
}

async function handleUserBehavior(data) {
  logger.info('Processing user behavior event:', data);
  try {
    await redis.lpush(`user:${data.user_id}:behaviors`, JSON.stringify(data));
    await redis.ltrim(`user:${data.user_id}:behaviors`, 0, 99);
    logger.info(`User ${data.user_id} behavior recorded`);
  } catch (error) {
    logger.error('Failed to process user behavior:', error);
  }
}

const messageHandlers = {
  [TOPICS.ORDER_CREATED]: handleOrderCreated,
  [TOPICS.ORDER_PAID]: handleOrderPaid,
  [TOPICS.ORDER_COMPLETED]: handleOrderCompleted,
  [TOPICS.ORDER_CANCELLED]: handleOrderCancelled,
  [TOPICS.PAYMENT_SUCCEEDED]: handlePaymentSucceeded,
  [TOPICS.PAYMENT_FAILED]: handlePaymentFailed,
  [TOPICS.PAYMENT_REFUNDED]: handlePaymentRefunded,
  [TOPICS.USER_REGISTERED]: handleUserRegistered,
  [TOPICS.USER_AUTHENTICATED]: handleUserAuthenticated,
  [TOPICS.DRIVER_LOCATION]: handleDriverLocation,
  [TOPICS.RIDER_LOCATION]: handleRiderLocation,
  [TOPICS.USER_BEHAVIOR]: handleUserBehavior
};

async function startConsumer() {
  await connectDB();
  
  await consumer.connect();
  logger.info('Kafka consumer connected');

  const topicList = Object.values(TOPICS);
  for (const topic of topicList) {
    await consumer.subscribe({ topic, fromBeginning: false });
    logger.info(`Subscribed to topic: ${topic}`);
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const handler = messageHandlers[topic];
        
        if (handler) {
          await handler(data);
        } else {
          logger.warn(`No handler for topic: ${topic}`);
        }
      } catch (error) {
        logger.error(`Error processing message from ${topic}:`, error);
      }
    }
  });

  logger.info('Kafka consumer started successfully');
}

async function shutdown() {
  logger.info('Shutting down consumer...');
  await consumer.disconnect();
  await mongoose.disconnect();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startConsumer().catch(error => {
  logger.error('Failed to start consumer:', error);
  process.exit(1);
});

module.exports = { consumer, TOPICS };