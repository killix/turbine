# Turbine

[![Circle CI](https://circleci.com/gh/chute/turbine.svg?style=svg)](https://circleci.com/gh/chute/turbine)
[![Code Climate](https://codeclimate.com/github/chute/turbine/badges/gpa.svg)](https://codeclimate.com/github/chute/turbine)
[![Test Coverage](https://codeclimate.com/github/chute/turbine/badges/coverage.svg)](https://codeclimate.com/github/chute/turbine/code)
[![bitHound Score](https://www.bithound.io/chute/turbine/badges/score.svg?)](https://www.bithound.io/chute/turbine)

> Relay-like REST-friendly Immutable-based React data library

**[Work in progress]**

## Getting started

1. `npm install turbine`

## Usage

Turbine's usage with components is similar to Relay.

```js
import React, { PropTypes } from 'react'
import Turbine, { graphql } from 'turbine'

const AssetsView = React.createClass({
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
        assets(album_id: <album_id>) {
          id,
          url
        }
      }
    `
  }
})
```

**Warning:** Format of the query may be changed in a future release.

`<album_id>` is a query parameter that can be resolved from `props` passed by the parent component: `<AssetsView album_id="abc" />`.

### Query params

You can also have query params that are owned by of the component itself.
For example, if your component renders a list of items, the number of items
can be updated when user scrolls. Use `queryParams` and `setQueryParams`:

```js
var AssetsView = React.createClass({
  render() {
    return (
      <div>
        { this.props.assets.map(asset => <img src={asset.url} />) }
      </div>
    )
  },

  loadMore() {
    var count = this.props.queryParams.count
    this.props.setQueryParams({  // <- update queryParams
      count: count + 30
    })
  }
})

module.exports = Turbine.container(AssetsView, {
  queryParams: {  // <- default queryParams
    count: 30
  },
  queries: {
    assets: graphql`
      {
        assets(album_id: <album_id>, count: <count>) {
          id,
          url
        }
      }
    `
  }
})
```


### Models

`assets` in the graph query above is a bit of magic. Turbine translates the name to `Asset`,
and for things to work, you need to register the `Asset` model with Turbine. You'd typically
do this in your entry module:

```js
Turbine.init({
  models: {
    'Asset': Asset
  }
})
```

Turbine expects each model to have `query`, `find`, `create`, `update`, `delete`/`remove` methods.
It's recommended to use Immutable records as your models:

```js
export default class Asset extends new Immutable.Record({
  // define attributes with default values
  id: null,
  url: ''
}) {
  // define methods
  static query(params) {
    return new Promise(...)
  }
}
```


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
