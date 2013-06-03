var rpc = require('../')
var test = require('tap').test

test('single arg', function (t) {
  t.plan(2)

  var a = rpc({
    hello: function (cb) { cb(null, 'hello') }
  })
  var b = rpc()
  a.pipe(b).pipe(a)

  b.createRemoteCall('hello')(function (err, str) {
    t.equal(err, null)
    t.equal(str, 'hello')
  });
})
