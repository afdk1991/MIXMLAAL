const express = require('express');
const cors = require('cors');
const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/service-registry.log' })
  ]
});

const app = express();
app.use(cors());
app.use(express.json());

const services = new Map();
const HEARTBEAT_INTERVAL = 30000;
const SERVICE_EXPIRE = 120000;

setInterval(() => {
  const now = Date.now();
  for (const [name, service] of services.entries()) {
    if (now - service.lastHeartbeat > SERVICE_EXPIRE) {
      services.delete(name);
      logger.warn(`Service expired: ${name}`);
    }
  }
}, 10000);

function registerService(serviceInfo) {
  const { name, url, port, healthCheck, metadata } = serviceInfo;
  
  const service = {
    name,
    url,
    port,
    healthCheck: healthCheck || `/health`,
    metadata: metadata || {},
    instances: [],
    lastHeartbeat: Date.now(),
    registeredAt: new Date().toISOString()
  };

  if (!services.has(name)) {
    services.set(name, service);
    logger.info(`Service registered: ${name} -> ${url}`);
    return { success: true, message: `Service ${name} registered successfully` };
  }

  const existingService = services.get(name);
  const instanceId = `${name}-${Date.now()}`;
  
  existingService.instances.push({
    instanceId,
    url,
    port,
    status: 'UP',
    lastHeartbeat: Date.now()
  });
  
  existingService.lastHeartbeat = Date.now();
  
  logger.info(`Service instance registered: ${instanceId} -> ${url}`);
  return { success: true, instanceId, message: `Instance ${instanceId} of ${name} registered` };
}

function deregisterService(name, instanceId) {
  if (!services.has(name)) {
    return { success: false, message: `Service ${name} not found` };
  }

  const service = services.get(name);
  
  if (instanceId) {
    const index = service.instances.findIndex(i => i.instanceId === instanceId);
    if (index !== -1) {
      service.instances.splice(index, 1);
      logger.info(`Service instance deregistered: ${instanceId}`);
      return { success: true, message: `Instance ${instanceId} deregistered` };
    }
    return { success: false, message: `Instance ${instanceId} not found` };
  }

  services.delete(name);
  logger.info(`Service deregistered: ${name}`);
  return { success: true, message: `Service ${name} deregistered` };
}

function heartbeat(name, instanceId) {
  if (!services.has(name)) {
    return { success: false, message: `Service ${name} not found` };
  }

  const service = services.get(name);
  const instance = service.instances.find(i => i.instanceId === instanceId);
  
  if (instance) {
    instance.lastHeartbeat = Date.now();
    service.lastHeartbeat = Date.now();
    return { success: true, message: 'Heartbeat received' };
  }

  return { success: false, message: 'Instance not found' };
}

function discoverService(name) {
  if (!services.has(name)) {
    return { success: false, message: `Service ${name} not found`, instances: [] };
  }

  const service = services.get(name);
  const availableInstances = service.instances.filter(i => {
    return Date.now() - i.lastHeartbeat < SERVICE_EXPIRE;
  });

  return {
    success: true,
    name: service.name,
    instances: availableInstances,
    count: availableInstances.length
  };
}

function getAllServices() {
  const result = [];
  for (const [name, service] of services.entries()) {
    result.push({
      name,
      instances: service.instances.filter(i => Date.now() - i.lastHeartbeat < SERVICE_EXPIRE),
      registeredAt: service.registeredAt,
      lastHeartbeat: service.lastHeartbeat
    });
  }
  return result;
}

function getHealthyServices() {
  const result = [];
  for (const [name, service] of services.entries()) {
    const healthyInstances = service.instances.filter(i => {
      return Date.now() - i.lastHeartbeat < SERVICE_EXPIRE;
    });
    
    if (healthyInstances.length > 0) {
      result.push({
        name,
        healthyCount: healthyInstances.length,
        totalCount: service.instances.length,
        instances: healthyInstances
      });
    }
  }
  return result;
}

app.post('/register', (req, res) => {
  const { name, url, port, healthCheck, metadata } = req.body;
  
  if (!name || !url) {
    return res.status(400).json({ success: false, message: 'Name and URL are required' });
  }

  const result = registerService({ name, url, port, healthCheck, metadata });
  res.json(result);
});

app.post('/deregister', (req, res) => {
  const { name, instanceId } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Service name is required' });
  }

  const result = deregisterService(name, instanceId);
  res.json(result);
});

app.post('/heartbeat', (req, res) => {
  const { name, instanceId } = req.body;
  
  if (!name || !instanceId) {
    return res.status(400).json({ success: false, message: 'Name and instanceId are required' });
  }

  const result = heartbeat(name, instanceId);
  res.json(result);
});

app.get('/discover/:name', (req, res) => {
  const { name } = req.params;
  const result = discoverService(name);
  res.json(result);
});

app.get('/services', (req, res) => {
  res.json({ services: getAllServices() });
});

app.get('/services/healthy', (req, res) => {
  res.json({ services: getHealthyServices() });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'service-registry',
    timestamp: new Date().toISOString(),
    registeredServices: services.size,
    totalInstances: Array.from(services.values()).reduce((sum, s) => sum + s.instances.length, 0)
  });
});

app.get('/stats', (req, res) => {
  const allServices = getAllServices();
  const stats = {
    totalServices: allServices.length,
    totalInstances: allServices.reduce((sum, s) => sum + s.instances.length, 0),
    healthyServices: getHealthyServices().length,
    services: allServices.map(s => ({
      name: s.name,
      instances: s.instances.length
    }))
  };
  res.json(stats);
});

const SERVICE_NAME = process.env.SERVICE_NAME || 'service-registry';
const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:3032';
const PORT = process.env.PORT || 3032;

async function selfRegister() {
  try {
    await axios.post(`${SERVICE_URL}/register`, {
      name: SERVICE_NAME,
      url: SERVICE_URL,
      port: PORT,
      metadata: { type: 'infrastructure' }
    });
    logger.info(`${SERVICE_NAME} self-registered`);
  } catch (error) {
    logger.error('Failed to self-register:', error.message);
  }
}

app.listen(PORT, async () => {
  logger.info(`Service registry running on port ${PORT}`);
  await selfRegister();
  
  setInterval(async () => {
    try {
      await axios.post(`${SERVICE_URL}/heartbeat`, {
        name: SERVICE_NAME,
        instanceId: `${SERVICE_NAME}-self`
      });
    } catch (error) {
    }
  }, HEARTBEAT_INTERVAL);
});

module.exports = app;