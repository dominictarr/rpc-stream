var rpc = require('../')
var es = require('event-stream')

var a = rpc({
  hello: function (n, cb) {
    console.error('child: HELLO ', n)
    cb(null, 'HELLO ' + n)
  }
})

a.pipe(es.duplex(process.stdout, process.stdin)).pipe(a)
process.stdin.resume()

