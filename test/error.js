var rpc = require('../')
var test = require('tape')

test('error', function (t) {
  t.plan(3)

  var b = rpc()
  b.pipe(rpc({
    hello: function (args, cb) {
      var err = new Error('oops');
      err.foo = 'bar';
      cb(err);
    }
  })).pipe(b)

  b.createRemoteCall('hello')(function (err) {
    t.ok(err instanceof Error, 'instanceof')
    t.equal(err.message, 'oops', 'message')
    t.equal(err.foo, 'bar', 'custom properties')
  })
})
