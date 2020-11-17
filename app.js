const express = require('express');
const { Router } = require('./routes/Router');

const app = express();
app.use(Router);

module.exports = app;
