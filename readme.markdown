#rpc-stream

`RpcStream` is a dead simple (75 loc) rpc system that works over any full-duplex text/byte/json stream.
There's also a [Python port](https://github.com/riga/rpyc-stream), e.g. for cross-language RPC-over-SSH.

## rant


There are a bunch of people have already written node rpc systems, but most of them has done it _right_ yet.
My beef is that all these systems is that they are tightly coupled to, or wrapped around servers. what if I want to encrypt the messages? what if I want to send the messages over stdin/out, or over ssh? of write them to a temp file? there is one abstraction that matches all of these cases; the `Stream`

I should just be able to do this:

``` js
  REMOTE_SSH_STREAM           //<-- pipe data from a remote source
    .pipe(DECRYPT_STREAM)    //through some ('middleware') streams (ssh already encrypts, but I'm paranoid)
    .pipe(GUNZIP_STREAM)
    .pipe(RPC)               //<--- pipe the data through the RPC system.
    .pipe(GZIP_STREAM)
    .pipe(ENCYPT_STREAM)
    .pipe(REMOTE_SSH_STREAM)  //<-- and back to the remote

  //with something very similar on the other side.
```
RPC framework (AHEM! RPC MODULE!), _you_ just worry about calling the right function, _I'll_ decide where you go...

update: [dnode@1.0.0](https://github.com/substack/dnode) now has first class streams, and you can pipe it where you like! 

## usage

```
var rpc = require('rpc-stream')

//create a server, that answers questions.
//pass in functions that may be called remotely.
var server = rpc({hello: function (name, cb) {
  cb(null, 'hello, '+name)
}})

//create a client, that asks questions.
var client = rpc()

//pipe rpc instances together!
client.pipe(server).pipe(client)

var remote = client.wrap(['hello'])
remote.hello('JIM', function (err, mess) {
  if(err) throw err
  console.log(mess)
})
```

### rpc(methods, isRaw)

returns a `RpcStream` that will call `methods` when written to. If the `isRaw` parameter is set to `true`, `JSON.stringify()`
is turned off and you just get a stream of objects, in case you want to do your own parsing/stringifying.

### RpcStream\#wrap(methodNames)

returns a wrapped object with the remote's methods.
the client needs to already know the names of the methods.
accepts a string, and array of strings, or a object.
if it's an object, `wrap` will use the keys as the method names. 

```
//create rpc around the fs module.
var fsrpc = rpc(require('fs'))
//pipe, etc
```

then, in another process...

```
var fsrpc = rpc()
//pipe, etc

//wrap, with the right method names.
var remoteFs = fs.wrap(require('fs'))

remoteFs.mkdir('/tmp/whatever', function (err, dir) {
  //yay!  
})

```

now, the second process can call the `fs` module in the first process!
`wrap` does not use the methods for anything. it just wants the names.

### RpcStream#rpc(name, args, cb)

this gets invoked by wrap. but you could call it directly.

``` js
rpc().wrap('hello').hello(name, callback)
//is the same as
rpc().rpc('hello', [name], callback)
```

### RpcStream#pipe

this is why we are here. read [this](http://nodejs.org/api/stream.html#stream_stream_pipe_destination_options) and [this](https://github.com/joyent/node/blob/master/lib/stream.js)


## license

MIT/APACHE2
