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
})
