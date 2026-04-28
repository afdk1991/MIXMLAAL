const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Server is running'
    }
  });
});

app.get('/api/v1/test', (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Test endpoint working',
      time: new Date().toISOString()
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/v1/test`);
});