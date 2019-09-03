const chai = require('chai')
const supertest = require('supertest')
/* ADD ME! */
const app = require('../app')

const expect = chai.expect

let server

before(function(done) {
  return app.up().then(_server => {
    server = _server
    done()
  })
})

after(function() {
  server.close()
})

describe('app', function() {
  describe('up', function() {
    it('is a function', function() {
      expect(app.up).to.be.an.instanceof(Function)
    })
  })
  describe('/user', function() {
    describe('POST', function() {
      it('fails with an empty request body', function() {
        supertest(app).
          post('/user').
          expect(400, done)
        })

        it('succeeds with valid name, username, and email', function(done) {
        supertest(server).
          post('/user').
          send({
            email: 'test@email.com',
            name: 'testName',
            username: 'testUsername'
          }).
          set('content-type', 'application/json').
          expect(200, done)
      })
    })
  })
})
