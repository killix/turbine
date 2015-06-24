# Turbine  [![Circle CI](https://circleci.com/gh/chute/turbine.svg?style=svg)](https://circleci.com/gh/chute/turbine)

> Relay-like REST-friendly Immutable-based React data library

**[Work in progress]**

## Getting started

1. `npm install turbine`

## Usage

Turbine currently works with Immutable records as your models. It also expects the models to have
`query`, `find`, `create`, `update`, `delete`/`remove` methods.

```js
export default class Asset extends new Immutable.Record({
  id: null,
  url: ''
}) {
  // define methods
}
```

Then you need to register the models with Turbine. You'd typically do this in your entry module:

```js
Turbine.init({
  models: {
    'Asset': Asset
  }
})
```

Turbine's usage with components is similar to Relay.

```js
import React, { PropTypes } from 'react'
import Turbine, { graphql } from 'turbine'

var AssetsView = React.createClass({
  propTypes: {
    assets: PropTypes.array.isRequired
  },

  render() {
    // ...
  }
})

export default Turbine.container(AssetsView, {
  queries: {
    assets: graphql`
      {
        assets(sort: <sort>) {
          id,
          url
        }
      }
    `
  }
})
```

`sort` is a property that should be passed from the parent component: `<AssetsView sort="time" />`

**Warning:** The format of the query may be changed in a future release.


## Development

1. Fork the repo
2. `git clone git@github.com:[yourname]/turbine && cd turbine && npm i`
3. Work your magic...
4. Be sure you have no linting warnings/errors and tests pass.
5. Push and open a pull request.

### Linting

```sh
npm run lint
```

*Note:* It's recommended to install eslint plugin into your [code editor](http://eslint.org/docs/user-guide/integrations.html).

### Testing

```sh
npm test
```

or continuously

```sh
npm i -g karma-cli
karma start
```

## License

(c) 2015 Chute Corporation. Released under the terms of the MIT license.
