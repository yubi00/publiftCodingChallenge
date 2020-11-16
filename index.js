const app = require('./app');
const port = 5000;

app.listen(port, () => {
  console.log(`The server started at port ${port}`);
});
