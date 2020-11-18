const request = require('supertest');
const app = require('../app');
const { store } = require('../routes/Router');
const getData = require('../utils/getData');

test('Should upload a csv file', async (done) => {
  const response = await request(app)
    .post('/api/uploads')
    .attach('file', 'tests/fixtures/analytics.csv')
    .expect(200);

  //assert that id and bufferedfile is stored in store as key, value
  expect(store).not.toBe(null);

  //assert that the unique identifier uuid is generated
  const match = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
    Object.keys(store)[0]
  );
  expect(match).toBe(true);

  //assert that the buffer of the file is stored
  const uploadedFile = store[Object.keys(store)[0]];
  expect(uploadedFile instanceof Buffer).toBe(true);
  done();
});

test('should process csv file by passing unique identifier as a query parameter', async (done) => {
  const id = Object.keys(store)[0];
  const csvData = await getData(store[id]);
  expect(csvData).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        Date: '20201012'
      })
    ])
  );

  const response = await request(app).get(`/api/${id}`).expect(200);
  done();
});

test('should get average page view per day for different traffic type', async (done) => {
  const response = await request(app).get('/api/pageviews').expect(200);
  done();
});

test('should get ratio of users and sessions per day', async (done) => {
  const response = await request(app)
    .get('/api/userssessionsratio')
    .expect(200);
  done();
});

test('should get weeekly maximum sessions per traffic type', async (done) => {
  const response = await request(app).get('/api/weeklymaxsessions').expect(200);
  done();
});

test('should display appropriate error message for bad api request', async () => {
  const response = await request(app).get('/helloworld').expect(404);
  const errorMsg = {
    status: false,
    error: 'Error 404 Page not found'
  };

  expect(response.body).toMatchObject(errorMsg);
});
