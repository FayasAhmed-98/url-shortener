const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 

let mongoServer;

beforeAll(async () => {
  // Set up in-memory MongoDB server before running the tests
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Disconnect existing connections to avoid conflicts, then connect to the in-memory database
  await mongoose.disconnect();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Clean up the database and close the connection after all tests are complete
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('URL Shortener API', () => {

  // Test Case: Valid URL shortening
  it('should shorten a valid URL', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ long_url: 'https://www.google.com/' });

    // Expect status code 200 and a short_url to be returned
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('short_url');
  });

  // Test Case: Missing long_url in the request
  it('should return 400 for missing long_url', async () => {
    const res = await request(app).post('/api/shorten').send({});

    // Expect status code 400 for a bad request (missing long_url)
    expect(res.statusCode).toBe(400);
  });

  // Test Case: Invalid URL format
  it('should return 400 for invalid URL format', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ long_url: 'not-a-valid-url' });

    // Expect status code 400 and handle invalid URL format
    expect(res.statusCode).toBe(400);
  });

  // Test Case: Redirection to original URL from short URL
  it('should redirect to the original URL', async () => {
    // Create a short URL first
    const createRes = await request(app)
      .post('/api/shorten')
      .send({ long_url: 'https://www.google.com/' });
    const { short_url } = createRes.body;

    // Extract the short code from the returned short URL
    const shortCode = short_url.split('/').pop();

    // Request the shortened URL to test redirection
    const res = await request(app).get(`/${shortCode}`);
    
    // Expect the server to respond with a 302 (redirect) status
    expect(res.statusCode).toBe(302);
  });

  // Test Case: Non-existent short URL should return 404
  it('should return 404 for a non-existent short URL', async () => {
    // Make a request for a non-existent short URL
    const res = await request(app).get('/nonexistent');

    // Expect status code 404 and a corresponding error message
    expect(res.statusCode).toBe(404);
  });
});
