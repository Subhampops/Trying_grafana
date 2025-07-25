# Grafana React Monitoring Demo

Monitor custom events from a React app using an Express backend, Prometheus for metrics scraping, and Grafana for dashboards—**no Docker required**!

---
## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
    1. [Prerequisites](#1-prerequisites)
    2. [React Frontend Setup](#2-react-frontend-setup)
    3. [Express Backend Setup](#3-express-backend-setup)
    4. [Prometheus Setup](#4-prometheus-setup)
    5. [Grafana Setup](#5-grafana-setup)
    6. [Visualizing Metrics in Grafana](#6-visualizing-metrics-in-grafana)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---
## Project Overview

This guide walks you step-by-step through creating a toy monitoring pipeline. It teaches you:
- How to instrument an Express backend with Prometheus metrics (including from a React app!)
- How to run Prometheus and Grafana natively on your machine (no Docker)
- How to display live metrics and totals on Grafana dashboards

---
## Tech Stack

- React (frontend)
- Express.js with prom-client and express-prom-bundle (backend/metrics)
- Prometheus (metrics scraping/storage)
- Grafana (dashboard visualization)

---
## Folder Structure

```
/my-grafana-demo
  /node_modules
  /public
  /src         # React app code
  server.js    # Express backend
  package.json
/prometheus
  prometheus.exe
  prometheus.yml
/grafana     # As installed per your OS
```

---
## Setup Instructions

### 1. Prerequisites

- [Node.js and npm](https://nodejs.org/)
- [Prometheus](https://prometheus.io/download/) (download binary and extract)
- [Grafana](https://grafana.com/grafana/download) (install for your OS)
- Familiarity with command line basics

### 2. React Frontend Setup

```sh
npx create-react-app my-grafana-demo
cd my-grafana-demo
```

(Optional) In your component, add a button and handler:
```js
// Somewhere in src/App.js or your component
function handleButtonClick() {
  fetch("http://localhost:4000/my-event", { method: "POST" });
}
// Render a button:
Send Event
```

Start React:
```sh
npm start
```

### 3. Express Backend Setup

Install dependencies:
```sh
npm install express express-prom-bundle prom-client
```

Create `server.js` in the project root with:
```js
const express = require('express');
const promBundle = require('express-prom-bundle');
const client = require('prom-client');
const app = express();

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Custom metric to count React events
const myEventCounter = new client.Counter({
  name: 'my_custom_event_total',
  help: 'Count of custom events received from React'
});

app.post('/my-event', (req, res) => {
  myEventCounter.inc();
  res.sendStatus(200);
});

// Simple root endpoint
app.get('/', (req, res) => res.send('Hello from backend!'));

app.listen(4000, () => console.log('Server running on port 4000'));
```

Start the backend:
```sh
node server.js
```
- Check [http://localhost:4000](http://localhost:4000)  (should say "Hello from backend!")
- Check [http://localhost:4000/metrics](http://localhost:4000/metrics) for Prometheus metrics (including your custom one, after a button click).

### 4. Prometheus Setup

1. Download and **extract** Prometheus (e.g., to `D:\prometheus` on Windows).
2. Place `prometheus.yml` in that folder. Use this config:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'my-backend'
    static_configs:
      - targets: ['localhost:4000']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          app: "prometheus"
```

3. Start Prometheus (from your Prometheus folder):
    - Windows:
      ```sh
      cd D:\prometheus
      prometheus.exe --config.file=prometheus.yml
      ```
    - Mac/Linux:
      ```sh
      ./prometheus --config.file=prometheus.yml
      ```
4. Visit [http://localhost:9090](http://localhost:9090) for the Prometheus UI.

### 5. Grafana Setup

1. Install Grafana (download & run installer for your OS).
2. Start Grafana:
      - Usually via the Start menu (Windows) or running `grafana-server` (macOS/Linux).
3. Visit: [http://localhost:3000](http://localhost:3000)
   - Login: `admin / admin`

4. **Add Prometheus as a data source:**
   - Go to *Connections > Data sources > Add data source > Prometheus*.
   - Set the URL: `http://localhost:9090`
   - Save & Test.

### 6. Visualizing Metrics in Grafana

1. Go to *Dashboards > New > New Dashboard*.
2. Click **Add Panel**.
3. In the *Query* field, enter:
   - For your backend’s default counter: `http_requests_total`
   - For your custom metric: `my_custom_event_total`
4. Choose **Stat** visualization (for totals) or other chart types.
5. Click **Apply** then **Save dashboard**.

- **To see the number increase, click the button in your React app!**

## Sending Custom Events From React

- Each button click in React sends a POST to `/my-event` on Express.
- The backend increments the Prometheus counter.
- Prometheus scrapes `/metrics` every 15s.
- In Grafana, `my_custom_event_total` shows the current total of events.

**To see rate (e.g., events per hour), use in Grafana:**
```promql
increase(my_custom_event_total[1h])
```

## Troubleshooting

- **Config errors?**  
  Run: `.\promtool.exe check config prometheus.yml` (Windows) or `./promtool check config prometheus.yml` (Linux/Mac).
- **No data in Grafana?**  
  - Check Prometheus UI (`localhost:9090/targets`) for scrape status.
  - Check backend is up and `/metrics` shows your metric.
  - Confirm Grafana’s data source URL matches.
- **CORS issues from React?**  
  Add CORS allow headers to your Express backend (for local dev).

## References

- [Grafana Docs](https://grafana.com/docs/)
- [Prometheus Docs](https://prometheus.io/docs/)
- [express-prom-bundle](https://www.npmjs.com/package/express-prom-bundle)
- [prom-client](https://www.npmjs.com/package/prom-client)

Clone, follow these instructions, and you’ll have a full local React/backend/Prometheus/Grafana pipeline up—**no Docker needed**.  
Feel free to copy and modify this README for your actual project!
