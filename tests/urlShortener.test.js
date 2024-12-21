const request = require('supertest');
const app = require('../index');

describe('API Endpoints', () => {
    it('should shorten a URL', async () => {
        const res = await request(app)
            .post('/shorten')
            .send({ long_url: 'https://example.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('short_url');
    });

    it('should redirect to the long URL', async () => {
        const shortUrl = 'abc123'; // Replace with an actual key after running
        const res = await request(app).get(`/${shortUrl}`);

        expect(res.statusCode).toBe(302);
    });
});
