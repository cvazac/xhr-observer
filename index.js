var start, stop
;(function() {
  var prototypes = []
  var keys = ['addEventListener', 'send', 'open']
  for (var i = 0; i < keys.length; i++) {
    prototypes[keys[i]] = XMLHttpRequest.prototype[keys[i]]
  }

  start = function(options) {
    function maybeCallback(method) {
      options && 'function' === typeof options[method] && options[method]()
    }

    XMLHttpRequest.prototype.open = function() {
      this.__url = arguments[1]
      prototypes['open'].apply(this, arguments)
    }

    // treat changes to 'readystatechange' as a loadend, under the correct `readyState` and `status` values
    XMLHttpRequest.prototype.addEventListener = function() {
      if (arguments[0] !== 'loadend') {
        prototypes['addEventListener'].apply(this, arguments)
        return
      }

      this.loadListeners = this.loadListeners || []
      this.loadListeners.push(arguments[1])
    }

    XMLHttpRequest.prototype.send = function() {
      prototypes['addEventListener'].call(this, 'loadend', function() {
        maybeCallback('beforeCallback')
        for (var i = 0; i < (this.loadListeners || []).length; i++) {
          try {
            this.loadListeners[i].apply(this, arguments)
          } catch (e) {}
        }
        maybeCallback('afterCallback')
      })

      if (this.onload) {
        var origOnload = this.onload
        this.onload = function () {
          maybeCallback('beforeCallback')
          try {
            origOnload.apply(this, arguments)
          } catch (e) {}
          maybeCallback('afterCallback')
        }
      }

      maybeCallback('schedule')
      prototypes['send'].apply(this, arguments)
    }
  }
  stop = function () {
    for (var key in prototypes) {
      if (prototypes.hasOwnProperty(key)) {
        XMLHttpRequest.prototype[key] = prototypes[key]
      }
    }
  }
})()

module.exports = {
  start: start,
  stop: stop
}
