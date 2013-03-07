var rpc = require('./')

var cycles = 100000

function test (cb) {
  cb(null, 'rawr')
}

var server = rpc({ test : test })
var client = rpc()
client.pipe(server).pipe(client)
var remote = client.wrap('test')

bench('native', test, function () {
  bench('rpc', remote.test)
})

function bench (name, fn, cb) {
  var start = Date.now()
  for (var i = 0; i < cycles; i++) {
    (function (i) {
      fn(function () {
        if (i+1 == cycles) {
          var dur = Date.now() - start
          console.log(name + ': ' + dur + 'ms (' + Math.round(cycles/dur*1000) + ' ops/s)') 
          if (cb) cb()
        }
      })
    })(i)
  }
}
