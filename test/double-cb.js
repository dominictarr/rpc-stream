var rpc = require('../')
var test = require('tape')

test('double callback', function (t) {
  var b = rpc()
  b.pipe(rpc({
    hello: function (cb) {
      cb(null, 'first')
      cb(null, 'second')
    }
  })).pipe(b)

  b.on('invalid callback id', function () {
    t.fail()
  })

  b.createRemoteCall('hello')(function (err, str) {
    t.equal(str, 'first')
  })

  t.end()
})
