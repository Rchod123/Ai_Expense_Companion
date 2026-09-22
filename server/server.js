require('dotenv').config();
const app = require('./app');
const port = Number(process.env.PORT || 5000);
app.listen(port, '0.0.0.0', () =>
  console.log(`Expense API listening at http://localhost:${port}/api/v1`),
);
