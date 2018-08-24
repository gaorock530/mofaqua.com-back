
(function (window) {
  /* Privade methods */
  

  /* Privade properties */
  var options = {
    autoconnect: false,
    reconnect: false,
    retry: 10,
    interval: 3000,
    protocol: null
  }

  var EVENT = [
    'open',
    'message',
    'close',
    'error'
  ];

  // var eventLoop = {};

  // var connection = {};
  


  /* constructor */
  function WSCONNECTION (url, op) {
    this.eventLoop = new Object();
    this.connection = {
      support: 'WebSocket' in window,
      readyState: 0,
      url: url,
      timer: undefined,
      socket: undefined,
      op: op,
    }
    this.protocol = op ? op.protocol : null;
    var sequence = 0;

    Object.defineProperty(this, 'readyState', {
      get: function () {
        return this.connection.readyState;
      }
    })

    Object.defineProperty(this, 'sequence', {
      get: function () {
        return sequence;
      },
      set: function (sequence) {
        sequence = sequence;
      }
    })

    // Object.defineProperty(this, 'connection', {
    //   get: function () {
    //     return this.connection.socket;
    //   }
    // })

    Object.defineProperty(this, 'showEvent', {
      get: function () {
        return this.eventLoop;
      }
    });

    if (typeof this.connection.op === 'object') {
      for (var i in this.connection.op) {
        if (i in options) options[i] = this.connection.op[i];
      }
    }

    this.connect();
  }
  

  WSCONNECTION.prototype.connect = function () {
    if (!this.connection.support) return console.warn('WebSocket is not supported.');
    if (this.connection.readyState === 1) return console.warn('connection is already made.');
    this.connection.readyState = 0;
    this.connection.socket = new WebSocket(this.connection.url, false || options.protocol);
    this.connection.socket.binaryType = 'arraybuffer';
    if (this.protocol === 'pulse') {
      console.log('attach ping/pong.');
      onactive = onactive.bind(this, this.connection.socket);
      onbreak = onbreak.bind(this, this.connection.socket);
      attach(window, 'focus', onactive);
      attach(window, 'blur', onbreak);
    };
    addEvent.call(this);
  }
  

  WSCONNECTION.prototype.on = function (evt, fn) {
    if (~EVENT.indexOf(evt)) {
      if (!this.eventLoop.hasOwnProperty(evt)) this.eventLoop[evt] = [];
      this.eventLoop[evt].push(fn);
    } else {
      console.warn(evt + ' is not valid event.');
      return false;
    }
  }

  

  

  WSCONNECTION.prototype.send = function (str) {
    if (this.connection.socket.readyState !== 1) return console.warn('no this.connection.'); 
    if (this.protocol === 'pulse') {
      this.connection.socket.send(str);
    }
    else {
      if (typeof str !== 'string' || str.length<1 || str.length>30) return console.warn('invalid string.'); 
      this.connection.socket.send(encode(JSON.stringify({type: 'chat', content: str})));
    }
  }

  

  /**
   * @api Privade
   */
  var destory = function () {

  }

  var reconnect = function () {
    if (this.connection.readyState !== 3) return console.warn('connection is already made.');
    this.connect();
  }
  

  /* ArrayBuffer */
  var encode = function (str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  var decode = function (buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  /**
   * 
   * @param {Event} evt 
   * @param {Callback} e 
   */
  var emit = function (evt, e) {
    if (this.eventLoop.hasOwnProperty(evt)) {
      for(var i=0, l=this.eventLoop[evt].length; i<l; i++) {
        this.eventLoop[evt][i](e);
      }
    }
  }

  var addEvent = function () {
    onopen = onopen.bind(this);
    onclose = onclose.bind(this);
    onmessage = onmessage.bind(this);
    onerror = onerror.bind(this);
    attach(this.connection.socket, 'close', onclose);
    attach(this.connection.socket, 'open', onopen);
    attach(this.connection.socket, 'message', onmessage);
    attach(this.connection.socket, 'error', onerror);
  }
  var removeEvent = function () {
    detach(this.connection.socket, 'close', onclose);
    detach(this.connection.socket, 'open', onopen);
    detach(this.connection.socket, 'message', onmessage);
    detach(this.connection.socket, 'error', onerror);
    this.connection.socket= null;
  }

  /**
   * 
   * @param {Object} obj object which will be attach function to 
   * @param {Event} evt event to attach
   * @param {Function} fn function fires
   */
  var attach = function (obj, evt, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(evt, fn, false);
    } else if (obj.attachEvent) {
      obj.attachEvent('on' + evt, fn);
    } else {
      obj['on' + evt] = fn;
    }
  }
  var detach = function (obj, evt, fn) {
    if (obj.removeEventListener) {
      obj.removeEventListener(evt, fn, false);
    } else if (obj.detachEvent) {
      obj.attachEvent('on' + evt, fn);
    } else {
      obj['on' + evt] = null;
    }
  }
  /**
   * @description All events 
   * @param {Event} e response returned from original Event handler
   */
  var onopen = function (e) {
    this.connection.readyState = e.target.readyState;
    this.connection.socket.send(encode('1'));
    clearInterval(this.connection.timer);
    // handshake
    if (options.protocol !== 'pulse')
    this.connection.socket.send(encode(JSON.stringify({type: 'handshake', room: '123', login: false})));
    emit.call(this, 'open', e);
  }
  var onclose = function (e) {
    this.connection.readyState = e.target.readyState;
    emit.call(this, 'close', e);
    removeEvent.call(this);
    if (this.protocol === 'pulse') {
      detach(window, 'focus', onactive);
      detach(window, 'blur', onbreak);
    };
    console.warn('connection closed');
    if (options.reconnect) {
      clearInterval(this.connection.timer);
      this.connection.timer = setInterval(reconnect.bind(this), options.interval);
    }
  }
  var onmessage = function (e) {
    
    const data = e.data instanceof ArrayBuffer ? JSON.parse(decode(e.data)) : JSON.parse(e.data);
    WSCONNECTION.sequence = data.value + 1;
    if (data.type === 'handshake') {
      this.send(JSON.stringify({type: 'handshake', value: WSCONNECTION.sequence}));
    } else if (data.type === 'heartbeat') {
      this.send(JSON.stringify({type: 'heartbeat', value: WSCONNECTION.sequence}));
    }
    emit.call(this, 'message', data);

  }
  var onerror = function (e) {
    emit.call(this, 'error', e);
  }

  var onactive = function (ws) {
    if (ws.readyState !== 1) return console.warn('connection closed.');
    ws.send(JSON.stringify({type: 'a', value: WSCONNECTION.sequence+1}));
  }
  var onbreak = function (ws) {
    if (ws.readyState !== 1) return console.warn('connection closed.');
    ws.send(JSON.stringify({type: 'b', value: WSCONNECTION.sequence+1}));
  }

  window.WSCONNECTION = WSCONNECTION;
}(window));