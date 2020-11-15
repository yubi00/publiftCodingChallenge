const express = require('express');
const Router = require('./routes/Router');

const app = express();
app.use(Router);

const port = 5000;

app.listen(port, () => {
  console.log(`The server started at port ${port}`);
});
