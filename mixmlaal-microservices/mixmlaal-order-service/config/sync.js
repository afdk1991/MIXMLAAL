const kafka = require('kafka-node');

// Kafka配置
const kafkaConfig = {
  host: process.env.KAFKA_HOST || 'localhost:9092',
  clientId: 'order-service',
  groupId: 'order-service-group'
};

// 消息生产者
let producer = null;

// 消息消费者
let consumer = null;

// 初始化Kafka
const initKafka = () => {
  try {
    const client = new kafka.KafkaClient({
      kafkaHost: kafkaConfig.host,
      clientId: kafkaConfig.clientId
    });

    // 创建生产者
    producer = new kafka.Producer(client);

    producer.on('ready', () => {
      console.log('Kafka生产者初始化成功');
    });

    producer.on('error', (error) => {
      console.error('Kafka生产者错误:', error);
    });

    // 创建消费者
    consumer = new kafka.Consumer(
      client,
      [],
      {
        groupId: kafkaConfig.groupId,
        autoCommit: true,
        autoCommitIntervalMs: 5000,
        fetchMaxBytes: 1024 * 1024,
        fetchMaxWaitMs: 100,
        fromOffset: 'latest'
      }
    );

    consumer.on('message', (message) => {
      handleMessage(message);
    });

    consumer.on('error', (error) => {
      console.error('Kafka消费者错误:', error);
    });

    // 订阅主题
    consumer.addTopics(['order-events', 'payment-events', 'user-events'], (error, added) => {
      if (error) {
        console.error('订阅主题失败:', error);
      } else {
        console.log('订阅主题成功:', added);
      }
    });

  } catch (error) {
    console.error('Kafka初始化失败:', error);
  }
};

// 处理消息
const handleMessage = (message) => {
  try {
    const payload = JSON.parse(message.value);
    console.log('收到消息:', message.topic, payload);

    // 根据主题处理不同的消息
    switch (message.topic) {
      case 'order-events':
        handleOrderEvent(payload);
        break;
      case 'payment-events':
        handlePaymentEvent(payload);
        break;
      case 'user-events':
        handleUserEvent(payload);
        break;
      default:
        console.log('未知主题:', message.topic);
    }
  } catch (error) {
    console.error('处理消息失败:', error);
  }
};

// 处理订单事件
const handleOrderEvent = (payload) => {
  // 处理订单相关事件
  console.log('处理订单事件:', payload);
};

// 处理支付事件
const handlePaymentEvent = (payload) => {
  // 处理支付相关事件
  console.log('处理支付事件:', payload);
};

// 处理用户事件
const handleUserEvent = (payload) => {
  // 处理用户相关事件
  console.log('处理用户事件:', payload);
};

// 发送消息
const sendMessage = (topic, payload) => {
  if (producer && producer.ready) {
    const messages = [{
      topic,
      messages: JSON.stringify(payload),
      partition: 0
    }];

    producer.send(messages, (error, data) => {
      if (error) {
        console.error('发送消息失败:', error);
      } else {
        console.log('发送消息成功:', data);
      }
    });
  } else {
    console.error('Kafka生产者未就绪');
  }
};

module.exports = {
  initKafka,
  sendMessage
};