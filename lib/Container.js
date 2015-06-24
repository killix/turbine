'use strict'

var React = require('react/addons')
var assign = React.__spread
var Rotor = require('./Rotor')
var capitalize = require('lodash/string/capitalize')
var endsWith = require('lodash/string/endsWith')

/**
 * Container wraps a React component and provides data.
 *
 * @example
 * ```js
 * var MyComponent = React.createClass({
 *   render() {
 *     return <div>{ this.props.album.name }</div>
 *   }
 * })
 *
 * module.exports = Turbine.container(MyComponent, {
 *   queries: {
 *     album: graphql`
 *       {
 *         album(id: <album_id>) {
 *           name
 *         }
 *       }
 *     `
 *   }
 * })
 * ```
 *
 * `album_id` needs to be passed as a prop from the parent component.
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
 * module.exports = Turbine.container(AssetsView, {
 *   queryParams: {
 *     count: 30
 *   },
 *   queries: {
 *     assets: graphql`
 *       {
 *         assets(album_id: <album_id>, count: <count>) {
 *           id,
 *           url
 *         }
 *       }
 *     `
 *   }
 * })
 * ```
 *
 * @param  {Component} Component           React component
 * @param  {Component} options.loading     loading component
 * @param  {Object}    options.queryParams params for the queries
 * @param  {Object}    options.queries     Turbine queries
 * @return {Component}                     wrapper component
 */
module.exports = function(Component, options) {
  options = options || {}
  options.queries = options.queries || {}
  var componentName = Component.displayName || Component.name
  var Loading = options.loading
  var queryParams = options.queryParams
  var queries = {}

  Object.keys(options.queries).forEach(function(prop) {
    queries[prop] = options.queries[prop]
  })

  var Container = React.createClass({
    displayName: componentName + 'Container',

    statics: {
      getQuery(prop) {
        return queries[prop]
      }
    },

    // workaround for child-based context
    // remove in 0.14 which uses parent-based context
    contextTypes: {
      router: React.PropTypes.func
    },
    childContextTypes: {
      router: React.PropTypes.func
    },
    getChildContext: function() {
      return this.context
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
    setQueryParams: function(params) {
      Object.keys(params).forEach(function(param) {
        queryParams[param] = params[param]
      })

      this.forceUpdate()
    },

    componentWillMount: function() {
      Rotor._store._state.on('change', this.stateChanged)

      this.updateState(this.getStateFromStore())
    },

    componentWillUnmount: function() {
      Rotor._store._state.off('change', this.stateChanged)
    },

    stateChanged: function() {
      console.time(componentName + ' render') // eslint-disable-line no-console
      this.updateState(this.getStateFromStore(), function() {
        console.timeEnd(componentName + ' render') // eslint-disable-line no-console
      })
    },

    updateState: function(state, callback) {
      if (state) {
        this.setState(state, callback)
      }
    },

    getStateFromStore: function() {
      var state = {}

      var queriesKeys = Object.keys(queries)
      for (var i = 0; i < queriesKeys.length; i++) {
        var queryKey = queriesKeys[i]
        var query = queries[queryKey]

        // execute template function to get object representing the query
        var queryObject = query(assign({}, queryParams, this.props))

        var model = Object.keys(queryObject)[0]  // just one key until we know more about the specs
        var actionParams = queryObject[model].params
        var method = 'getItem'
        if (endsWith(model, 's')) {
          model = model.substring(0, model.length - 1)
          method = 'getList'
        }

        var value = Rotor._store[method](capitalize(model), actionParams)

        // if any value is not defined yet, return null state (= still loading)
        if (typeof value === 'undefined') { return null }

        state[queryKey] = value
      }

      return state
    },

    render: function() {
      if (this.state) {
        // remove withContext in 0.14
        return React.withContext(this.context, function() {
          return React.createElement(Component, assign({}, this.props, this.state))
        }.bind(this))
      } else if (Loading) {
        return React.createElement(Loading)
      } else {
        return null
      }
    }
  })

  return Container
}
