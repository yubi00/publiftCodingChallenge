const request = require('supertest');
const app = require('../app');
const { store } = require('../routes/Router');

test('Should upload a csv file', async () => {
  const response = await request(app)
    .post('/api/uploads')
    .attach('file', 'tests/fixtures/analytics.csv')
    .expect(200);

  //assert that the unique identifier uuid was generated
  const match = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
    Object.keys(store)[0]
  );
  expect(match).toBe(true);

  //assert that the buffer of the file was stored
  const uploadedFile = store[Object.keys(store)[0]];
  expect(uploadedFile instanceof Buffer).toBe(true);
});

test('should retrive csv file by passing unique identifier as a query parameter', async () => {
  const id = Object.keys(store)[0];
  await request(app).get(`/api/${id}`).expect(200);
});
