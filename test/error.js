var rpc = require('../')
var test = require('tape')

test('error', function (t) {
  t.plan(4)

  var b = rpc()
  b.pipe(rpc({
    hello: function (args, cb) {
      var err = new Error('oops')
      err.foo = 'bar'
      Object.defineProperty(err, 'bar', {
        value: 'baz',
        enumerable: false
      })
      cb(err);
    }
  })).pipe(b)

  b.createRemoteCall('hello')(function (err) {
    t.ok(err instanceof Error, 'instanceof')
    t.equal(err.message, 'oops', 'message')
    t.equal(err.foo, 'bar', 'custom properties')
    t.equal(err.bar, 'baz', 'non enumerable properties')
  })
})

test('error custom prototype', function (t) {
  t.plan(2)

  function CustomError() {
    Error.call(this)
    this.message = 'oops'
  }
  CustomError.prototype = new Error
  CustomError.prototype.pro = 'to'

  var b = rpc()
  b.pipe(rpc({
    hello: function (args, cb) {
      cb(new CustomError('oops'))
    }
  })).pipe(b)

  b.createRemoteCall('hello')(function (err) {
    t.ok(err instanceof Error, 'instanceof')
    t.equal(err.pro, 'to', 'prototype properties')
  })
})
