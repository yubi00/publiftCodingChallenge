const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const moment = require('moment');
const getData = require('./utils/getData');
const { groupBy, avg } = require('./utils/queries');
const { formatDate } = require('./utils/dates');

const app = express();
const port = 5000;
const store = {};

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error('Please upload a csv file'));
    }
    cb(undefined, true);
  }
});

app.get('/', async (req, res) => {
  try {
    const files = Object.keys(store);
    const data = await getData(store[files[0]]);
    const json = JSON.stringify(data, null, 2);

    res.status(200).send(`<pre>${json}</pre>`);
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

app.get('/api/pageviews', async (req, res) => {
  try {
    const files = Object.keys(store);
    const data = await getData(store[files[0]]);
    const dataByDate = groupBy(data, 'Date');

    const avgPageViewByDate = dataByDate.map((data) => {
      const sum = data.reduce((sum, curr) => sum + parseInt(curr.Pageviews), 0);
      return {
        Date: data[0].Date,
        AveragePageViews: avg(sum, data.length)
      };
    });
    const json = JSON.stringify(avgPageViewByDate, null, 2);

    res.status(200).send(`<pre>${json}</pre>`);
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

app.get('/api/userssessions', async (req, res) => {
  try {
    const files = Object.keys(store);
    const data = await getData(store[files[0]]);
    const dataByDate = groupBy(data, 'Date');

    const usersSessionsRatio = dataByDate.map((data) => {
      const users = data.reduce((sum, curr) => sum + parseInt(curr.Users), 0);
      const sessions = data.reduce(
        (sum, curr) => sum + parseInt(curr.Sessions),
        0
      );

      return {
        Date: data[0].Date,
        UsersSessionsRatio: users / sessions
      };
    });

    const json = JSON.stringify(usersSessionsRatio, null, 2);
    res.status(200).send(`<pre>${json}</pre>`);
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

app.get('/api/weeklymaxsessions', async (req, res) => {
  try {
    const files = Object.keys(store);
    const data = await getData(store[files[0]]);
    const dataByTrafficType = groupBy(data, 'Traffic Type');

    const result = dataByTrafficType.map((data) => {
      return data.map((subdata) => {
        return {
          Date: subdata.Date,
          TrafficType: subdata['Traffic Type'],
          Sessions: subdata.Sessions,
          WeekNumber: moment(formatDate(subdata.Date)).isoWeekday(0).isoWeek() //Sunday as the first day of the week by setting 0
        };
      });
    });

    const groupedbyWeekNo = result.map((data) => {
      const groupedData = groupBy(data, 'WeekNumber');
      return groupedData;
    });

    const weeklyMaxSessions = groupedbyWeekNo.map((data) => {
      return {
        TrafficType: data[0][0].TrafficType,
        MaxSessionsWeekly: data.map((subdata) => {
          return {
            WeekNumber: subdata[0].WeekNumber,
            maxSessions: Math.max.apply(
              Math,
              subdata.map(function (o) {
                return o.Sessions;
              })
            )
          };
        })
      };
    });

    const json = JSON.stringify(weeklyMaxSessions, null, 2);
    res.status(200).send(`<pre>${json}</pre>`);
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

app.post('/api/uploads', upload.single('csvfile'), (req, res) => {
  try {
    const id = uuid();
    if (!store[id]) {
      store[id] = req.file.buffer;
    }
    res.status(200).send({
      status: true,
      data: {
        id,
        file: req.file.buffer
      }
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      error: 'Couldnot upload file'
    });
  }
});

app.get('/api/:id', (req, res) => {
  const id = req.params.id;
  const files = Object.keys(store);
  try {
    if (files.length === 0) throw new Error('No files yet');

    const fileExist = files.some((file) => file === id);
    if (!fileExist) throw new Error('file doesnot exist');

    res.status(200).send({
      status: true,
      id,
      file: store[id]
    });
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`The server started at port ${port}`);
});
