var rpc  = require('../')
var es   = require('event-stream')
var test = require('tape')

var obj = {
  hello: function (name, cb) {
    cb(null, 'HI, ' + name)
  }
}

test('simple', function (t) {

  //second arg=true means stream of raw js objects,
  //do not stringify/parse.
  var a = rpc(obj, true)
  b = rpc(null, true)

  //a and b are streams. connect them with pipe.
  b.pipe(a).pipe(b)

  b.rpc('hello', ['JIM'], function (err, message) {
    t.error(err)
    t.equal(message, 'HI, JIM')
  })

  var B = b.wrap('hello')
  B.hello('JIM', function (err, message) {
    t.error(err)
    t.equal(message, 'HI, JIM')
    t.end()
  })
})

test('tcp', function (t) {
  var net = require('net')
  var port = Math.round(40000 * Math.random()) + 1000
  var a = rpc(obj)
  var b = rpc()

  var server = net.createServer(function (sock) {
    a.pipe(sock).pipe(a)
  }).listen(port, function () {
    b.pipe(net.connect(port)).pipe(b)
    
    b.wrap('hello').hello('SILLY', function (err, mes) {
      t.equal(mes, 'HI, SILLY')
      a.end()
      b.end()
      server.close()
      t.end()
    })
  })
})


var path = require('path')

test('child_process', function(t) {
  var cp = require('child_process')
  .spawn(process.execPath, [require.resolve('./support/cp')])
  var b = rpc()

  b.pipe(es.duplex(cp.stdin, cp.stdout)).pipe(b)
  
  cp.stderr.pipe(process.stderr, {end: false})
  b.wrap('hello').hello('WHO?', function (err, mes) {
    t.error(err)
    t.equal(mes, 'HELLO WHO?')
    cp.kill()
    t.end()
  })
})

