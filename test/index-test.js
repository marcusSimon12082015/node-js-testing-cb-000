const chai = require('chai')
const supertest = require('supertest')
/* ADD ME! */
const app = require('../app')

const expect = chai.expect

describe('app', function() {
  describe('up', function() {
    it('is a function', function() {
      expect(app.up).to.be.an.instanceof(Function)
    })
  })
})
