const bookshelf = require('../db/bookshelf');

const Comment = require('./comment');
const Post = require('./post');

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  posts: function() {
    return this.hasMany('Post', 'author');
  },
  comments: function() {
    return this.hasMany('Comment');
  },
});

module.exports = bookshelf.model('User', User);
