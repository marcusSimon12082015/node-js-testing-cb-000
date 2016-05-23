const chai = require('chai')

const bookshelf = require('../../app/db/bookshelf')
const User = require('../../app/models/user')

const expect = chai.expect

const mockUser = {
  email: 'email@email.com',
  name: 'Name',
  username: 'username'
}

describe('User', () => {
  let transaction;

  beforeEach(done => {
    return bookshelf.transaction(t => {
      transaction = t
      done()
    })
  })

  afterEach(() => {
    transaction.rollback()
  })

  it('saves a record to the database', () => {
    return User.forge().
      save(mockUser, { transacting: transaction }).
      then(user => {
        expect(user.get('id')).to.be.a('number')
      })
  })
})
