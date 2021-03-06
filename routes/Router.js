const express = require('express');
const Router = express.Router();
const multer = require('multer');
const { v4: uuid } = require('uuid');
const moment = require('moment');
const getData = require('../utils/getData');
const { groupBy, avg, ratio } = require('../utils/queries');
const { formatDate } = require('../utils/dates');
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

Router.get('/api/pageviews', async (req, res) => {
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

    res.status(200).send({
      status: true,
      data: avgPageViewByDate
    });
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

Router.get('/api/userssessionsratio', async (req, res) => {
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
        Users: users,
        Sessions: sessions,
        UsersSessionsRatio: ratio(users, sessions)
      };
    });

    res.status(200).send({
      status: true,
      data: usersSessionsRatio
    });
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

Router.get('/api/weeklymaxsessions', async (req, res) => {
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

    res.status(200).send({
      status: true,
      data: weeklyMaxSessions
    });
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

Router.post('/api/uploads', upload.single('file'), (req, res) => {
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

Router.get('/api/:id', async (req, res) => {
  const id = req.params.id;
  const files = Object.keys(store);
  try {
    if (files.length === 0) throw new Error('No files yet');

    const fileExist = files.some((file) => file === id);
    if (!fileExist) throw new Error('file doesnot exist');

    const data = await getData(store[id]);

    res.status(200).send({
      status: true,
      data
    });
  } catch (err) {
    res.status(404).send({ status: false, error: err.message });
  }
});

Router.get('*', (req, res) => {
  res.status(404).send({
    status: false,
    error: 'Error 404 Page not found'
  });
});

module.exports = {
  store,
  Router
};
