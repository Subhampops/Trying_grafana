const express = require('express');
const promBundle = require('express-prom-bundle');
const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

app.get('/', (req, res) => res.send('Hello from backend!'));
app.listen(4000, () => console.log('Server running on port 4000'));
