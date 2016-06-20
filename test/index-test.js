const chai = require('chai')
const supertest = require('supertest')
/* ADD ME! */
const app = require('../app')

const expect = chai.expect

let server

before(done => {
  return app.up().then(_server => {
    server = _server
    done()
  })
})

after(() => {
  server.close()
})

describe('app', () => {
  describe('up', () => {
    it('is a function', () => {
      expect(app.up).to.be.an.instanceof(Function)
    })
  })

  describe('/user', () => {
    describe('POST', () => {
      it('fails with an empty request body', done => {
        supertest(server).
          post('/user').
          expect(400, done)
      })

      it('succeeds with valid name, username, and email', done => {
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
