var es = require('event-stream')

module.exports = function (obj, raw) {
  obj = obj || {}
  var cbs = {}, count = 1
  function flattenError(err) {
    if(err instanceof Error)
      for(var k in err)
        err[k] = err[k] //flatten so err stringifies 
    return err
  }
  var s = es.through(function (data) {
    //write - on incoming call 
    data = data.slice()
    var i = data.pop(), args = data.pop(), name = data.pop()
    //if(~i) then there was no callback.    

    if(name != null) {
      args.push(function () {
        var args = [].slice.call(arguments)
        flattenError(args[0])
        if(~i) s.emit('data', [args, i]) //responses don't have a name.
      })
      try {
        obj[name].apply(obj, args)
      } catch (err) {
        console.error(err ? err.stack : err)
       if(~i) s.emit('data', [[flattenError(err)], i])
      }
    } else if(!cbs[i]) {
      //this is some kind of error.
      //either end is mixed up,
      //or the called twice.
      //log this error, but don't throw.
      //this process shouldn't crash because that one did wrong

      return console.error('ERROR: unknown callback id: '+i, data)
    } else {
      cbs[i].apply(null, args)
      delete cbs[i] //no longer need this
    }
  })

  var rpc = s.rpc = function (name, args, cb) {
    if(cb) cbs[++count] = cb
    if(count == 9007199254740992) count = 0 //reset if max
    //that is 900 million million. 
    //if you reach that, dm me, 
    //i'll buy you a beer. @dominictarr
    s.emit('data', [name, args, cb ? count : -1])
  }

  function keys (obj) {
    var keys = []
    for(var k in obj) keys.push(k)
    return keys
  }

  s.wrap = function (remote) {
    var w = {}
    ;(Array.isArray(remote)     ? remote
    : 'string' == typeof remote ? [remote]
    : remote = keys(remote)
    ).forEach(function (k) {
      w[k] = function () {
        var args = [].slice.call(arguments)
        if('function' == typeof args[args.length - 1])
          cb = args.pop()
        rpc(k, args, cb)
      }
    })
    return w
  }
  if(raw)
    return s
  var parse = es.parse()
  //if not 'raw', wrap the string to return
  var duplex = es.duplex(parse
              , parse.pipe(s).pipe(es.stringify()))
  duplex.wrap = s.wrap
  duplex.rpc = s.rpc
  return duplex
}
