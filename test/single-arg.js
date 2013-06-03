var rpc = require('../')
var test = require('tap').test

test('single arg', function (t) {
  t.plan(2)

  var b = rpc()
  b.pipe(rpc({
    hello: function (cb) { cb(null, 'hello') }
  })).pipe(b)

  b.createRemoteCall('hello')(function (err, str) {
    t.notOk(err)
    t.equal(str, 'hello')
  })
})
