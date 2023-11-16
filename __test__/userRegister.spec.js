
const app = require('../server');

const request = require('supertest');
const databaseConnection = require('../config/database');
beforeAll(() => {
    return databaseConnection();
});

describe('Catagories ADD Test', () => {
    it('return 200 OK when Catagoris is valid', (done) => {
        request(app).post('/api/v1/catagories').send({
            catagories: 'apple'
        }).then(res => {
            expect(res.status).toBe(200);
            done();
        });
    });
    it('return 200 OK when Catagoris is not valid', (done) => {
        request(app).post('/api/v1/catagories').send({
            catagories: ''
        }).then(res => {

            expect(res.body.message).toBe('catagories must be required');
            done();
        });
    });

});


describe('catagories Delete Test', () => {

    it('user Delete ', (done) => {
        const id = '61bc57820e801a9288414338'
        request(app).delete(`/api/v1/${id}`).then(data => {

            expect(data.body.message).toBe('Catagorie not  found');
            done();
        });

    });



});