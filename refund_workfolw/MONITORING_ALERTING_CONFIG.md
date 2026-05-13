# Return & Refund Workflow - Monitoring & Alerting Configuration

## Overview

Tài liệu này định nghĩa tất cả metrics, dashboards, và alerts cho workflow trả hàng hoàn tiền.

---

## 1. Key Performance Indicators (KPIs)

### 1.1 Business KPIs

| KPI                             | Target   | Warning  | Critical  | Frequency |
| ------------------------------- | -------- | -------- | --------- | --------- |
| Return Request Success Rate     | >95%     | <92%     | <85%      | Daily     |
| Average Return Processing Time  | <14 days | >18 days | >21 days  | Daily     |
| Refund Success Rate             | >98%     | <95%     | <90%      | Daily     |
| Average Refund Processing Time  | <2 hours | >6 hours | >12 hours | Hourly    |
| Return Inspection Pass Rate     | >85%     | <80%     | <70%      | Daily     |
| Customer Satisfaction (Returns) | >4/5     | <3.5/5   | <3/5      | Weekly    |
| Fraud Detection Rate            | <2%      | >3%      | >5%       | Daily     |

### 1.2 Technical KPIs

| KPI                              | Target  | Warning | Critical | Frequency |
| -------------------------------- | ------- | ------- | -------- | --------- |
| API Response Time (p95)          | <2s     | >5s     | >10s     | Real-time |
| API Error Rate                   | <0.5%   | >1%     | >5%      | Real-time |
| Webhook Delivery Rate            | >99%    | >98%    | <95%     | Real-time |
| Webhook Processing Latency (p95) | <100ms  | >200ms  | >500ms   | Real-time |
| Database Sync Lag                | 0s      | >60s    | >300s    | Real-time |
| Service Availability             | >99.9%  | >99%    | <99%     | Real-time |
| Payment Gateway Availability     | >99.95% | >99.9%  | <99%     | Real-time |

---

## 2. Metrics Definition

### 2.1 Return Service Metrics

```yaml
# Request Metrics
http_requests_total{service="return-service", endpoint="/api/v1/return-requests", method="POST"}
http_requests_total{service="return-service", endpoint="/api/v1/return-requests/*/approval"}
http_requests_total{service="return-service", endpoint="/api/v1/return-requests/*/inspection"}

# Latency Metrics
http_request_duration_seconds{service="return-service", endpoint="/api/v1/return-requests", quantile="0.95"}
http_request_duration_seconds{service="return-service", endpoint="/api/v1/return-requests/*/approval", quantile="0.95"}

# Error Metrics
http_requests_errors_total{service="return-service", error_type="VALIDATION_ERROR"}
http_requests_errors_total{service="return-service", error_type="PAYMENT_SERVICE_ERROR"}
http_requests_errors_total{service="return-service", error_type="LOGISTICS_SERVICE_ERROR"}

# Business Metrics
return_requests_total{status="CREATED"}
return_requests_total{status="APPROVED"}
return_requests_total{status="REJECTED"}
return_requests_total{status="INSPECTION_PASSED"}
return_requests_total{status="INSPECTION_FAILED"}
return_requests_total{status="REFUNDED"}
return_requests_total{status="CANCELLED"}

# Processing Time Metrics
return_processing_time_seconds{phase="creation_to_approval"}
return_processing_time_seconds{phase="approval_to_delivery"}
return_processing_time_seconds{phase="delivery_to_inspection"}
return_processing_time_seconds{phase="inspection_to_refund"}
return_processing_time_seconds{phase="total_journey"}

# Integration Metrics
logistics_api_calls_total
logistics_api_errors_total
logistics_webhook_delivery_total
logistics_webhook_errors_total

payment_api_calls_total
payment_api_errors_total
payment_webhook_delivery_total
payment_webhook_errors_total
```

### 2.2 Payment Service Metrics

```yaml
# Refund Processing
refund_requests_total{method="WALLET"}
refund_requests_total{method="ORIGINAL_PAYMENT"}
refund_requests_total{method="BANK_TRANSFER"}

refund_success_total{method="WALLET"}
refund_success_total{method="ORIGINAL_PAYMENT"}
refund_success_total{method="BANK_TRANSFER"}

refund_failed_total{reason="GATEWAY_TIMEOUT"}
refund_failed_total{reason="INSUFFICIENT_BALANCE"}
refund_failed_total{reason="INVALID_CARD"}

# Processing Time
refund_processing_time_seconds{method="WALLET", quantile="0.95"}
refund_processing_time_seconds{method="ORIGINAL_PAYMENT", quantile="0.95"}
refund_processing_time_seconds{method="BANK_TRANSFER", quantile="0.95"}

# Wallet Metrics
wallet_balance_total{user_id="*"}
wallet_transactions_total{type="CREDIT"}
wallet_transactions_total{type="DEBIT"}

# Retry Metrics
refund_retry_attempts_total
refund_max_retries_exceeded_total
```

### 2.3 Database Metrics

```yaml
# Connection Pool
db_connections_active{service="return-service"}
db_connections_active{service="payment-service"}
db_connections_max{service="return-service"}

# Query Performance
db_query_duration_seconds{database="ecommerce", quantile="0.95"}
db_query_duration_seconds{database="payment_db", quantile="0.95"}
db_slow_queries_total{database="ecommerce", threshold_ms="1000"}
db_slow_queries_total{database="payment_db", threshold_ms="1000"}

# Replication Lag
db_replication_lag_seconds{source="ecommerce", target="payment_db"}
```

---

## 3. Prometheus Configuration

### 3.1 prometheus.yml

```yaml
# prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: "ecommerce"
    environment: "production"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - "alertmanager:9093"

rule_files:
  - "/etc/prometheus/rules/return-refund.yml"

scrape_configs:
  # Return Service
  - job_name: "return-service"
    static_configs:
      - targets: ["return-service:3001"]
    metrics_path: "/metrics"
    scrape_interval: 15s

  # Payment Service
  - job_name: "payment-service"
    static_configs:
      - targets: ["payment-service:8080"]
    metrics_path: "/metrics"
    scrape_interval: 15s

  # Logistics Service
  - job_name: "logistics-service"
    static_configs:
      - targets: ["logistics-service:8080"]
    metrics_path: "/metrics"
    scrape_interval: 15s

  # MySQL - ecommerce
  - job_name: "mysql-ecommerce"
    static_configs:
      - targets: ["mysql-exporter-ecommerce:9104"]
    metrics_path: "/metrics"

  # MySQL - payment_db
  - job_name: "mysql-payment_db"
    static_configs:
      - targets: ["mysql-exporter-payment:9104"]
    metrics_path: "/metrics"

  # Node Exporter
  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]
```

---

## 4. Alert Rules

### 4.1 return-refund.yml (Alert Rules)

```yaml
# prometheus/rules/return-refund.yml

groups:
  - name: return_refund_service
    interval: 30s

    rules:
      # HIGH PRIORITY ALERTS

      - alert: ReturnServiceDown
        expr: up{job="return-service"} == 0
        for: 2m
        labels:
          severity: critical
          service: return-service
        annotations:
          summary: "Return Service is DOWN"
          description: "Return Service {{ $labels.instance }} has been down for 2 minutes"
          runbook: "https://wiki.company.com/return-service-down"

      - alert: PaymentServiceDown
        expr: up{job="payment-service"} == 0
        for: 2m
        labels:
          severity: critical
          service: payment-service
        annotations:
          summary: "Payment Service is DOWN"
          description: "Payment Service {{ $labels.instance }} has been down for 2 minutes"

      - alert: LogisticsServiceDown
        expr: up{job="logistics-service"} == 0
        for: 2m
        labels:
          severity: critical
          service: logistics-service
        annotations:
          summary: "Logistics Service is DOWN"

      - alert: HighAPIErrorRate
        expr: rate(http_requests_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High API error rate ({{ $value | humanizePercentage }})"
          description: "Error rate for {{ $labels.endpoint }} is {{ $value | humanizePercentage }}"

      - alert: WebhookDeliveryFailure
        expr: rate(webhook_errors_total[5m]) / rate(webhook_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Webhook delivery failure rate high ({{ $value | humanizePercentage }})"
          description: "{{ $labels.webhook_type }} webhooks failing at {{ $value | humanizePercentage }}"

      - alert: DatabaseConnectionPoolExhausted
        expr: db_connections_active >= db_connections_max * 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $labels.service }} using {{ $value }} / {{ $value }} connections"

      - alert: RefundProcessingFailure
        expr: rate(refund_failed_total[15m]) > 0.01
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "High refund failure rate ({{ $value | humanizePercentage }})"
          description: "Refunds failing at {{ $value | humanizePercentage }}, reason: {{ $labels.reason }}"

      # MEDIUM PRIORITY ALERTS

      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds[5m])) > 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High API latency (p95: {{ $value | humanizeDuration }})"
          description: "{{ $labels.endpoint }} p95 latency is {{ $value | humanizeDuration }}"

      - alert: SlowDatabaseQueries
        expr: rate(db_slow_queries_total{threshold_ms="1000"}[5m]) > 0.1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High rate of slow queries"
          description: "{{ $labels.database }} experiencing slow queries (>1s)"

      - alert: HighRefundRetryRate
        expr: rate(refund_retry_attempts_total[15m]) / rate(refund_requests_total[15m]) > 0.05
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High refund retry rate ({{ $value | humanizePercentage }})"
          description: "{{ $value | humanizePercentage }} of refunds are being retried"

      - alert: StuckReturns
        expr: count(return_request_status{status="REFUND_PROCESSING", duration_seconds>3600}) > 5
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "{{ $value }} returns stuck in REFUND_PROCESSING state"
          description: "{{ $value }} returns have been in REFUND_PROCESSING for >1 hour"

      - alert: WebhookProcessingLatency
        expr: histogram_quantile(0.95, rate(webhook_processing_duration_seconds[5m])) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High webhook processing latency"
          description: "{{ $labels.webhook_type }} p95 latency is {{ $value | humanizeDuration }}"

      - alert: InspectionFailureRateHigh
        expr: rate(return_status_total{status="INSPECTION_FAILED"}[1h]) / rate(return_status_total{status="INSPECTION_PASSED", status="INSPECTION_FAILED"}[1h]) > 0.2
        for: 2h
        labels:
          severity: warning
        annotations:
          summary: "High inspection failure rate ({{ $value | humanizePercentage }})"
          description: "Inspection failure rate is {{ $value | humanizePercentage }}, above 20% threshold"

      # LOW PRIORITY ALERTS

      - alert: LowWalletBalance
        expr: wallet_balance_total < 100000
        for: 1h
        labels:
          severity: info
        annotations:
          summary: "Wallet balance low"
          description: "Wallet {{ $labels.user_id }} balance is VND {{ $value }}"

      - alert: HighRefundProcessingTime
        expr: histogram_quantile(0.95, rate(return_processing_time_seconds{phase="inspection_to_refund"}[1h])) > 7200
        for: 1h
        labels:
          severity: info
        annotations:
          summary: "High refund processing time"
          description: "Refund processing p95 latency is {{ $value | humanizeDuration }}"
```

---

## 5. Grafana Dashboard Configuration

### 5.1 Return Service Dashboard (JSON)

```json
{
  "dashboard": {
    "title": "Return & Refund Service - Overview",
    "tags": ["return", "refund", "ecommerce"],
    "timezone": "Asia/Ho_Chi_Minh",
    "refresh": "30s",
    "panels": [
      {
        "title": "Return Request Status Distribution",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (status) (return_requests_total)"
          }
        ]
      },
      {
        "title": "API Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds{service='return-service'}[5m]))"
          }
        ],
        "yaxes": [{ "label": "Duration (s)" }]
      },
      {
        "title": "Refund Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(refund_success_total[1h]) / rate(refund_requests_total[1h])"
          }
        ]
      },
      {
        "title": "Webhook Delivery Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(webhook_delivery_success_total[5m]) / rate(webhook_delivery_total[5m])"
          }
        ]
      },
      {
        "title": "Database Query Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(db_query_duration_seconds{database='ecommerce'}[5m]))"
          }
        ]
      },
      {
        "title": "Return Processing Time by Phase",
        "type": "heatmap",
        "targets": [
          {
            "expr": "rate(return_processing_time_seconds[5m])"
          }
        ]
      },
      {
        "title": "Active API Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "http_requests_in_progress{service='return-service'}"
          }
        ]
      },
      {
        "title": "Stuck Returns Alert",
        "type": "stat",
        "targets": [
          {
            "expr": "count(return_request_status{status='REFUND_PROCESSING', duration_seconds>3600})"
          }
        ],
        "thresholds": "0,5,10"
      }
    ]
  }
}
```

### 5.2 Refund Processing Dashboard

```json
{
  "dashboard": {
    "title": "Refund Processing - Detailed",
    "tags": ["refund", "payment"],
    "panels": [
      {
        "title": "Refund Volume by Method",
        "type": "stackedgraph",
        "targets": [
          {
            "expr": "rate(refund_requests_total[1h])"
          }
        ]
      },
      {
        "title": "Refund Success Rate by Method",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(refund_success_total[1h]) / rate(refund_requests_total[1h])"
          }
        ]
      },
      {
        "title": "Refund Processing Time by Method",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(refund_processing_time_seconds[5m]))"
          }
        ]
      },
      {
        "title": "Payment Gateway Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job='payment-gateway'}"
          }
        ]
      },
      {
        "title": "Wallet Balance Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "wallet_balance_total"
          }
        ]
      }
    ]
  }
}
```

---

## 6. Alert Notifications

### 6.1 Alertmanager Configuration

```yaml
# alertmanager/alertmanager.yml

global:
  resolve_timeout: 5m
  slack_api_url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

templates:
  - "/etc/alertmanager/templates/*.tmpl"

route:
  receiver: "default"
  group_by: ["alertname", "cluster", "service"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 4h

  routes:
    # Critical alerts to PagerDuty
    - match:
        severity: critical
      receiver: "pagerduty-team"
      group_wait: 0s
      repeat_interval: 1h

    # Warning alerts to Slack
    - match:
        severity: warning
      receiver: "slack-team"
      repeat_interval: 4h

    # Info alerts to logs
    - match:
        severity: info
      receiver: "devnull"

receivers:
  - name: "default"
    slack_configs:
      - channel: "#alerts"
        title: "Alert: {{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"

  - name: "pagerduty-team"
    pagerduty_configs:
      - service_key: "YOUR-PAGERDUTY-KEY"
        description: "{{ .GroupLabels.alertname }}"

  - name: "slack-team"
    slack_configs:
      - channel: "#return-team-alerts"
        title: "Warning: {{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"

  - name: "devnull"
    # Silently ignore info alerts
```

### 6.2 Notification Templates

```tmpl
{{/* alertmanager/templates/slack.tmpl */}}

{{ define "slack.alert.title" -}}
{{ .GroupLabels.alertname }}
{{- end }}

{{ define "slack.alert.text" -}}
{{ range .Alerts -}}
*Alert:* {{ .Labels.alertname }}
*Severity:* {{ .Labels.severity }}
*Service:* {{ .Labels.service }}
{{ if .Labels.endpoint }}*Endpoint:* {{ .Labels.endpoint }}{{ end }}
*Description:* {{ .Annotations.description }}
*Runbook:* {{ .Annotations.runbook }}
{{ end -}}
{{ end }}
```

---

## 7. Monitoring Implementation

### 7.1 Return Service Metrics Export

```typescript
// src/infrastructure/monitoring/metrics.ts

import { Counter, Histogram, Gauge } from "prom-client";

export const returnServiceMetrics = {
  // Request metrics
  httpRequests: new Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "endpoint", "status_code"],
  }),

  httpRequestDuration: new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "endpoint"],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),

  // Return request metrics
  returnRequests: new Counter({
    name: "return_requests_total",
    help: "Total return requests by status",
    labelNames: ["status"],
  }),

  returnProcessingTime: new Histogram({
    name: "return_processing_time_seconds",
    help: "Return processing time by phase",
    labelNames: ["phase"],
    buckets: [1, 5, 10, 60, 300, 3600, 86400],
  }),

  // Refund metrics
  refundRequests: new Counter({
    name: "refund_requests_total",
    help: "Total refund requests",
    labelNames: ["method", "status"],
  }),

  // Webhook metrics
  webhookDelivery: new Counter({
    name: "webhook_delivery_total",
    help: "Total webhook deliveries",
    labelNames: ["webhook_type", "status"],
  }),

  webhookProcessingTime: new Histogram({
    name: "webhook_processing_duration_seconds",
    help: "Webhook processing duration",
    labelNames: ["webhook_type"],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  }),
};

// Middleware to record metrics
export function metricsMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - startTime) / 1000;
    returnServiceMetrics.httpRequests
      .labels(req.method, req.path, res.statusCode)
      .inc();
    returnServiceMetrics.httpRequestDuration
      .labels(req.method, req.path)
      .observe(duration);
  });

  next();
}
```

---

## 8. Logging & Tracing

### 8.1 Structured Logging

```yaml
# docker-compose.yml - ELK Stack

version: "3.8"

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
```

### 8.2 Winston Logger Configuration

```typescript
// src/infrastructure/logging/logger.ts

import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Log with context
logger.info("Return request created", {
  return_id: 1,
  order_id: 12345,
  customer_id: 100,
  amount: 500000,
});
```

---

## 9. Deployment Checklist

- [ ] Configure Prometheus scrape targets
- [ ] Deploy alert rules
- [ ] Create Grafana dashboards
- [ ] Configure Alertmanager receivers
- [ ] Set up ELK stack for logging
- [ ] Configure distributed tracing (Jaeger)
- [ ] Set up on-call rotation
- [ ] Create runbooks for each alert
- [ ] Test alert notifications
- [ ] Document escalation procedures

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-24  
**Status:** Reference Document
