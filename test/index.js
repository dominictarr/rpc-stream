var rpc = require('..')
var es  = require('event-stream')

var obj = {
  hello: function (name, cb) {
    cb(null, 'HI, ' + name)
  }
}

exports['simple'] = function (t) {

  var a = rpc(obj)

  b = rpc()

  //a and b are streams. connect them with pipe.
  b.pipe(a).pipe(b)

  console.log(a, b)

  b.rpc('hello', ['JIM'], function (err, message) {
    if(err) throw err
    console.log(message)
  })

  var B = b.wrap('hello')
  console.log(B)
  B.hello('JIM', function (err, message) {
    if(err) throw err
    console.log(message)
  })
  t.end()
}

function sync(source, serial) {
  source
    .pipe(es.stringify())
    .pipe(serial)
    .pipe(es.parse())
    .pipe(source)
}

exports.tcp = function (t) {
  var net = require('net')
  var request = require('request')
  var port = Math.round(40000 * Math.random()) + 1000
  var a = rpc(obj)
  var b = rpc()

  var server = net.createServer(function (sock) {
    sync(a, sock)
  }).listen(port, function () {
    sync(b, net.connect(port)) 
    
    b.wrap('hello').hello('SILLY', function (err, mes) {
      console.log(mes)
      t.equal(mes, 'HI, SILLY')
      a.end()
      b.end()
      server.close()
      t.end()
    })
  })
}

if(!module.parent) { 
  var a = rpc({
    hello: function (n, cb) {
      console.error('child: HELLO ', n)
      cb(null, 'HELLO ' + n)
    }
  })
  console.error('obj', obj)
  sync(a, es.duplex(process.stdout, process.stdin))
  process.stdin.resume()
}

exports.cp = function(t) {
  var cp = require('child_process').spawn(process.execPath, [__filename])
  var b = rpc()
  sync(b, es.duplex(cp.stdin, cp.stdout))
  cp.stderr.pipe(process.stderr, {end: false})
  b.wrap('hello').hello('WHO?', function (err, mes) {
    if(err) throw err
    t.equal(mes, 'HELLO WHO?')
    cp.kill()
    t.end()
  })
}

