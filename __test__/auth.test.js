const request = require('supertest');
const express = require('express');
const router = require('../routes/auth');

const app = new express();
app.use('/', router);

describe('Test Auth Routes', function () {

  test('responds to /logout', async () => {
    const res = await request(app).post('/logout');
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toEqual('Logged out successfully');
  });

  test('responds to /google/url', async function(){
    const res = await request(app).get('/google/url');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("url")
    expect(res.body.url).not.toBe(null)
  })

  test('responds to /google/', async function(){
    const res = await request(app).get('/google')
    expect(res.statusCode).toBe(302)
  })

});