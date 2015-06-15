'use strict'

var React = require('react')
var merge = require('lodash/object/merge')

module.exports = (store) => {
  /**
   * Container wraps a React component and provides data.
   *
   * @example
   * // in Data.js
   * module.exports = new Turbine(...)
   *
   * // in MyComponent.jsx
   * var Data = require('./Data')
   *
   * ```js
   * var MyComponent = React.createClass({
   *   render() {
   *     return <div>{ this.props.album.name }</div>
   *   }
   * })
   *
   * module.exports = Data.container(MyComponent, {
   *   queries: {
   *     album: `
   *       Album(id: album_id) {
   *         name
   *       }
   *     `
   *   }
   * })
   * ```
   *
   * `album_id` needs to be passed as a prop from the parent component.
   * It's an example of how to pass query params from the owner component.
   *
   * @example
   * You can also have query params that are owned by of the component itself.
   * For example, if your component renders a list of items, the number of items
   * can be a updated when user scrolls to make the container ask for more data
   * for the component. Use `queryParams` and `setQueryParams`
   *
   * ```js
   * var AssetsView = React.createClass({
   *   render() {
   *     return ({ this.props.assets.map(asset => <img src={asset.url} />) })
   *   },
   *
   *   loadMore() {
   *     var count = this.props.queryParams.count
   *     this.props.setQueryParams({
   *       count: count + 30
   *     })
   *   }
   * })
   *
   * module.exports = Data.container(AssetsView, {
   *   queryParams: {
   *     count: 30
   *   },
   *   queries: {
   *     assets: `
   *       Assets(album_id: album_id, count: <count>) {
   *         url
   *         user
   *       }
   *     `
   *   }
   * })
   * ```
   *
   * @param  {Component} Component           React component
   * @param  {Component} options.loading     loading component
   * @param  {Object}    options.queryParams params for the queries
   * @param  {Object}    options.queries     data queries
   * @return {Component}                     wrapper component
   */
  return (Component, options) => {
    var componentName = Component.displayName || Component.name
    var Loading = options.loading
    var queryParams = options.queryParams
    var queries = {}

    Object.keys(options.queries).forEach(prop => {
      // TODO parse queries from GraphQL

      queries[prop] = options.queries[prop]
    })

    return React.createClass({
      displayName: componentName + 'Container',

      getQuery(prop) {
        return queries[prop]
      },

      /**
       * Update query param(s)
       *
       * @example
       * // to change number of requested items for a list
       * // Turbine will automatically fetch next page if needed
       * loadMore() {
       *   // read current params
       *   var count = this.props.queryParams.count
       *
       *   // update params
       *   this.props.setQueryParams({
       *     count: count + 5
       *   })
       * }
       *
       * @param {Object} params params to update
       */
      setQueryParams(params) {
        Object.keys(params).forEach(param => {
          queryParams[param] = params[param]
        })

        this.forceUpdate()
      },

      componentWillMount() {
        store._state.on('change', () => {
          console.time(componentName + ' render') // eslint-disable-line no-console
          this.updateState(this.getStateFromStore(), () => {
            console.timeEnd(componentName + ' render') // eslint-disable-line no-console
          })
        })

        this.updateState(this.getStateFromStore())
      },

      updateState(state, callback) {
        if (state) {
          this.setState(state, callback)
        }
      },

      getStateFromStore() {
        var state = {}

        var queriesKeys = Object.keys(queries)
        for (var i = 0; i < queriesKeys.length; i++) {
          var queryKey = queriesKeys[i]
          var query = queries[queryKey]
          var params = {}

          var paramsKeys = Object.keys(query.params)
          for (var j = 0; j < paramsKeys.length; j++) {
            var param = paramsKeys[j]
            params[param] = this.props[query.params[param]]
          }

          var method = query.action === 'query' ? 'getList' : 'getItem'  // refactor
          var value = store[method](query.model.name, params)

          // if any value is null, return null state (= still loading)
          if (typeof value === 'undefined') { return null }

          state[queryKey] = value
        }

        return state
      },

      render() {
        if (this.state) {
          return React.createElement(Component, merge({}, this.props, this.state))
        } else if (Loading) {
          return React.createElement(Loading)
        } else {
          return null
        }
      }
    })
  }
}
