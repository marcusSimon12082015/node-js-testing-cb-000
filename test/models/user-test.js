const chai = require('chai')

const bookshelf = require('../../app/db/bookshelf')
const User = require('../../app/models/user')

const expect = chai.expect

const mockUser = {
  email: 'email@email.com',
  name: 'Name',
  username: 'username'
}

describe('User', function() {
  let transaction;

   beforeEach(done => {
     bookshelf.transaction(t => {
       transaction = t
       done()
     })
   })

   afterEach(function() {
     return transaction.rollback()
   })
  it('saves a record to the database')
})
