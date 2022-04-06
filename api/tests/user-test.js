const request = require('supertest');
const app = require('../../server');

describe('GET /api/user', () => {

    it('returns all registered users in json', async() => {
        const response = await request(app)
        .get('/api/user/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
    });

});