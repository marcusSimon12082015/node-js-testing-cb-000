Node.js Testing
---

## Objectives

1. Describe a basic testing setup in Node.js
2. Explain how to use test hooks
3. Explain how to use spies

## Setup

In this lesson, we've set things up a bit differently from usual: we've given you a working app, and we want you to write the tests! Don't worry, we'll guide you each step of the way.

## Mocha

The first thing one might notice when diving into the world of testing in Node.js is that there are _a lot_ of options. [Jasmine](http://jasmine.github.io/), [jsunit](http://www.jsunit.net/), [tape](https://github.com/substack/tape), [lab](https://github.com/hapijs/lab) — where do we even start?

We're going to be opinionated and suggest that we start with [Mocha](https://mochajs.org/). Mocha is fairly lightweight, it runs our tests fairly quickly, and it's reasonably extensible — what's not to like? Moreover, Mocha has a large and active community, keeping the testing ecosystem up-to-date and running smoothly.

## Getting Started

We've ported over most of the code from the [Intro to Bookshelf](https://github.com/learn-co-curriculum/node-js-intro-to-bookshelf/) lesson, but we've changed modularized the models and removed the tests.

Before we do anything, let's go into the `test/` directory and set up a simple test to make sure everything is working as we expect. Create a file, `test/index-test.js`, and in that file write

``` javascript
const chai = require('chai')

const expect = chai.expect

describe('app', () => {
  it('runs')
})
```

In the console, run `./node_modules/.bin/mocha`. (We can shorten that command to just `mocha` if we `npm install -g mocha`; but at this stage of the game, we know better than to install global modules unnecessarily.) You should see printed to console

``` shell
  app
    - runs


  0 passing (9ms)
  1 pending
```

Very exciting. (If that didn't work, now is a good time to take a step back and debug a bit.) Mocha treats tests (calls to the `it` function) as _pending_ if they don't have a callback.

Reading the file from top to bottom, we can that we first require `chai`. [Chai](http://chaijs.com/) is an assertions library — basically `chai.expect(true).to.be(true)` is a handy way of saying "We expect `true` to be [identical to] `true`."

We then pull out the `expect` property on `chai`, since we'll be using the expect style of [BDD assertions](http://chaijs.com/api/bdd/).

Then, we encounter our first `describe` block. `describe` is a function that wraps a bunch of calls to the `it` function — it provides a way of organizing our code around different models and behaviors. `describe` calls can be nested:

``` javascript
describe('app', () => {
  describe('API', () => {
    describe('/some/endpoint', () => {
      // tests here
    })
  })
})
```

Finally, we hit on the venerable `it`. Like `describe`, it takes two arguments (the second one is optional): a description, and a callback. Let's add that callback now.

``` javascript
const chai = require('chai')

/* ADD ME! */
const app = require('../app')

const expect = chai.expect

describe('app', () => {
  describe('up', () => {
    it('is a function', () => {
      expect(app.up).to.be.an.instanceof(Function)
    })
  })
})
```

And run `node_modules/.bin/mocha`...

Hm. Well, that was disappointing. Now that we're loading `app` (really, `app/index.js`, since Node.js will figure out that we want the `index.js` file when we point it to a directory), we have to make sure that we're using the right database. So let's run `NODE_ENV=test node_modules/.bin/mocha`.

Huzzah!

``` shell
  app
    up
      ✓ is a function


  1 passing (12ms)
```

(Note that it's a good idea to write even these somewhat perfunctory tests to start out. While writing this, I found no fewer than three minor (but show-stopping) bugs in my application without ever having really run the app!)

## Testing Models

We'll get back to testing the server in just a bit. For now, we want to test our models. Open up (create and save) a file at `test/models/user-test.js`. Pull in the necessary dependencies:

``` javascript
const chai = require('chai')

const User = require('../../app/models/user')

const expect = chai.expect
```

and tell Mocha what you're testing:

``` javascript
describe('User', () => {
  it('saves a record to the database')
})
```

Hm, the description for that `if` call should have us scratching our heads. Presumably we're going to to be running these tests a lot. If we save a new user every time we run this test, we're going to have a lot of users sitting around in our test database. What's worse, we might end up interfering with other tests down the line: say we create a user here, and later we test some lookup functionality. We might find _the wrong user_, and pass the later test incorrectly, just because we created so many with this first test.

To the Batcave!

![](http://images.rapgenius.com/c6b46da26e0a15515529d689deb01c34.400x300x70.gif)

We'll need to set up some functionality to wrap all of our tests of the `User` model in a transaction. We can achieve this by declaring a variable in the `describe` clojure (handy, right?) and adding a `beforeEach` and `afterEach` hook. These hooks will run, as their names imply, before and after each test in the current `describe` callback.

``` javascript
describe('User', () => {
  let transaction;

  beforeEach(done => {
    bookshelf.transaction(t => {
      transaction = t
      done()
    })
  })

  afterEach(() => {
    return transaction.rollback()
  })

  it('saves a record to the database')
})
```

This way, we make `transaction` available when we're actually creating each user.

Note that we need to use a `done` callback with `beforeEach` because `bookshelf.transaction()` is asynchronous — we have to be sure that Mocha knows when we're finished. We don't need any such callback with `afterEach()` in this case because `transaction.rollback()` is synchronous.

Now we can write our test:

``` javascript
it('saves a record to the database', () => {
  return User.forge().
    // we can use a transaction by setting
    // a `transacting` param in the options
    // we pass to `save()`
    save(mockUser, { transacting: transaction }).
    then(user => {
      expect(user.get('id')).to.be.a('number')
    })
})
```

Now if we run our tests (adding the `--recursive` flag so that `mocha` can find our model tests) — `NODE_ENV=test node_modules/.bin/mocha --recursive` — we get... a big fat error. We have to run our migrations!

Let's add global `before` and `after` hooks for setting everything up. In `test/index-test.js`, add the following outside of any `describe` calls

``` javascript
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
```

This way, we can start our server — running any pending migrations — and then stop _after_ all of the tests have run.

Now when we run our tests (`NODE_ENV=test node_modules/.bin/mocha --recursive`), we should see

``` shell
  app
    up
      ✓ is a function

  User
    ✓ saves a record to the database
```

Nice!

**Your turn!**

Using the steps that we outlined above, define tests for `Post` and `Comment`. You should also do some of your own research to figure out how to write tests for the relationships between these models.

## A Brief Detour

We're getting a little tired of typing `NODE_ENV=test node_modules/.bin/mocha --recursive` (or searching through terminal history with up-arrow clicks) every time we want to run our tests. Wanting to encourage us to run tests often, Node.js provides a mechanism for aliasing our test command.

### package.json scripts

You might have seen the `scripts` section in the `package.json` previously. It provides a way of defining shell scripts that pertain to our pacakge (which, in this case, is the application we're building).

Each script is defined as a key-value pair in JSON. We can define a script `hello` by entering

``` json
{
  "scripts": {
    "hello": "echo \"hello!\""
   }
}
```

We can then run this script with `npm run hello` -- we should see "hello!" printed to the console.

Let's define a `test` script in a similar way.

``` json
{
  "scripts": {
    "test": "NODE_ENV=test mocha --recursive"
   }
}
```

You probably noticed that we left out the `node_modules/.bin` part of our test command. This is because when we run the command through the npm scripts, npm knows to look in the `.bin/` folder of `node_modules/` for the command there -- sweet! Further, since `test` is one of the aliases that npm recognizes by default, we don't even need the `run` in `npm run test` -- we can simply type `npm test` and we'll be good to go!

Try it out!

## Back to the Server

Okay, so together we tested our `User` model (and learned how to run our tests in a transaction so that we could interact with the actual models without mucking up the test database). You've used this knowledge to test `Comment` and `Post` yourself (you did, right?), so now let's return to testing our main interface to the application.

To do so, we're going to use a tool called `supertest`, which let's us test our routes as if we were making actual HTTP calls. Let's go ahead and install `supertest`: `npm install supertest --save-dev`. Note that we're using the `--save-dev` flag instead of `--save` because we wouldn't need `supertest` in a production deployment of the application.

Let's test `User`-creation first – specifically, the `POST /user` route. We’ll start by requiring `supertest`:

``` javascript
const supertest = require('supertest')
```

Then we'll add another `describe` call inside `describe('app')`.:

```javascript
describe('/user', () => {
  describe('POST', () => {
    it('fails with an empty request body', () => {
    })
  })
})
```

Let's start working on that first test — we're expecting to receive a 400 if we send an empty request body, so let's test for that. You can read [supertest's documentation](https://github.com/visionmedia/supertest) for more info.

``` javascript
it('fails with an empty request body', done => {
  supertest(app).
    post('/user').
    expect(400, done)
})
```

Note that we can just pass the `done` callback to the final `expect` (this is supertest's own expect, not the `expect` that we've pulled out of `chai`).

If everything is set up correctly, the test should pass without incident.

Now let's try testing actually creating a user. Remember, our users have `name`, `username`, and `email` fields, so we'll need to provide those in the tests. We'll add another `it` call under `/user POST`:

``` javascript
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

      /** This is new! */
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
```

Again, the test should pass if everything is set up properly.

## What's missing?

You might notice that these tests are pretty barebones, but that they're already pointing us towards certain improvements. For instance, we have no way of ensuring uniqueness on our `users` table — creating a user with the same email as another user won't be prevented, which could lead to weird results down the road.

The great thing about testing, though, is that it forces us to confront these problems early, before they become problems.

As we continue to work on these applications, remember to _follow the tests_: they give us a good sense of where our applications are weak, and where we might need to spend time paying down technical debt.


## Resources

- [BDD with chai.expect](http://chaijs.com/api/bdd/)
- [Mocha](https://mochajs.com)
- [supertest](https://github.com/visionmedia/supertest)
- [superagent](https://github.com/visionmedia/superagent) — supertest builds on superagent's API
