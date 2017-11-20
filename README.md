# stream-redux

# YAGA - leaflet-ng2

[![Build Status](https://travis-ci.org/atd-schubert/stream-redux.svg?branch=master)](https://travis-ci.org/atd-schubert/stream-redux)
[![Coverage Status](https://coveralls.io/repos/github/atd-schubert/stream-redux/badge.svg?branch=master)](https://coveralls.io/github/atd-schubert/stream-redux?branch=master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fatd-schubert%2Fstream-redux.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fatd-schubert%2Fstream-redux?ref=badge_shield)

Handle Redux like node streams, or Redux itself...

*It implements both interfaces: `Store` of Redux and `Duplex` of node streams*

## How to use

First you have to install this library from npm:

```bash
npm install --save stream-redux
```

This module works like the default Redux module, or like a stream. You should do something like that:


```js
const StreamRedux = require("stream-redux").StreamRedux;
const stream = new StreamRedux(anyReducer, anyOptionalEnhancer);
```

*Note: this module is written in TypeScript, you can use it with types, like this:*

```typescript
import { Action, StreamRedux } from "stream-redux";
const stream = new StreamRedux<number, Action>(counter);
function counter(state: number = 0, action: Action) {
  // ...
}
```

### Use it as the default Redux module

You just have to instantiate the store with `const stream = new StreamRedux(counter)`. After that you can use it like a
normal Redux store.

*Note: Take a look at [the official documentation](https://docs.reduxframework.com/) for further information*

### Use it as stream

You can use the method `.write` like `.dispatch`, but without getting the action as returned value.

You will get the initial state and each state after dispatching an action from the readable stream.

After calling the `.end()` method you will not be able to use either `.write` nor `.dispatch` anymore, like it is
typical for streams!

*Note: Take a look at [the official documentation](https://nodejs.org/api/stream.html#stream_class_stream_duplex) for
further information*

***Attention: node streams will buffer chunks, or in this case each state. This will maybe overload your RAM. If you
don't want to use it as readable stream flush it or consider using the default Redux library!***

### Use it mixed

You can mix both worlds like you prefer:

```js
import { expect } from "chai"; // not needed, just for this example....
import { StreamRedux } from "stream-redux";

const results = [0, 1, 2, 3, 2];
const stream = new StreamRedux(counter);

stream.on("data", (state) => {
    expect(state).to.equal(results.shift());
})

stream.on("end", () => {
    expect(results.length).to.equal(0);
});

stream.write({type: "INCREMENT"});
stream.dispatch({type: "INCREMENT"});
expect(stream.getState()).to.equal(2);
stream.write({type: "INCREMENT"});
expect(stream.getState()).to.equal(3);
stream.write({type: "DECREMENT"});
expect(stream.getState()).to.equal(1);

function counter(state = 0, action) {
  switch (action.type) {
  case 'INCREMENT':
    return state + 1;
  case 'DECREMENT':
    return state - 1;
  default:
    return state;
  }
}
```

## Scripts Tasks

Scripts registered in package.json:

* `transpile`: Transpile TypeScript Code to JavaScript
* `lint`: Use the linter for TypeScript Code
* `test`: Run software- and coverage-tests in node.
* `doc`: Build the API documentation.

## License

This library is released under the [ISC License](LICENSE).


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fatd-schubert%2Fstream-redux.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fatd-schubert%2Fstream-redux?ref=badge_large)

## Links

* [GitHub](https://github.com/atd-schubert/stream-redux)
* [NPM](https://www.npmjs.com/package/stream-redux)