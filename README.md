# xhr-observer

## Example usage:

```js
var xhrObserver = require('xhr-observer');
xhrObserver.start({
  schedule: function() { /* ... */ },
  beforeCallback: function() { /* ... */ },
  afterCallback: function() { /* ... */ },
})

xhrObserver.stop()
```
