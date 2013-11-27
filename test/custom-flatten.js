var rpc = require('../')
var test = require('tape')

test('custom flattenError', function (t) {
  t.plan(2)

  function flatten(err) {
    return {message: 'private'}
  }

  var b = rpc()
  b.pipe(rpc({
    hello: function (args, cb) {
      var err = new Error('oops')
      err.foo = 'bar'
      cb(err)
    }
  }, {flattenError: flatten})).pipe(b)

  b.createRemoteCall('hello')(function (err) {
    t.ok(err instanceof Error)
    t.equal(err.message, 'private')
  })
})