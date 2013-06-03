var rpc  = require('../')
var es   = require('event-stream')
var test = require('tape')

var obj = {
  helloThere: function (name, cb) {
    cb(null, 'Hello, ' + name)
  }
}

test('simple', function (t) {

  //second arg=true means stream of raw js objects,
  //do not stringify/parse.
  var a = rpc(null, true)
  b = rpc(null, true)

  a.createLocalCall('echo', function (x, y, cb) {
    t.ok(x)
    t.ok(y)
    cb(null, x, y)
  })

  var echo = b.createRemoteCall('echo')
  //a and b are streams. connect them with pipe.
  b.pipe(a).pipe(b)
  var r1 = Math.random(), r2 = Math.random()
  echo(r1, r2, function (err, _r1, _r2) {
    t.deepEqual([_r1, _r2], [r1, r2])
    t.end()
  })
})

