const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

// 创建追踪器
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: 'http://localhost:9411/api/v2/spans',
      jsonEncoder: jsonEncoder.JSON_V2
    })
  }),
  localServiceName: 'mixmlaal-api'
});

// 追踪中间件
function tracingMiddleware() {
  return zipkinMiddleware({ tracer });
}

// 为HTTP请求添加追踪
function traceRequest(options) {
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-B3-TraceId': tracer.id.traceId,
      'X-B3-SpanId': tracer.id.spanId,
      'X-B3-ParentSpanId': tracer.id.parentId || '',
      'X-B3-Sampled': '1'
    }
  };
}

module.exports = {
  tracer,
  tracingMiddleware,
  traceRequest
};
