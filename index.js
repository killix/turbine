'use strict'

var graphql = require('./lib/graphql')
var Container = require('./lib/Container')
var Store = require('./lib/Store')
var Rotor = require('./lib/Rotor')

/**
 * var models = {
 *   Asset: Asset
 * }
 *
 * Turbine.init({models: models})
 *
 * Turbine.container(MyComponent, {
 *   queries: {
 *     assets: `
 *       asset(id: <asset_id>) {
 *         url
 *       }
 *     `
 *   }
 * })
 */
module.exports = {
  graphql: graphql,

  init: function(config, initialState) {
    Rotor._store = new Store(config, initialState)
  },

  container: Container
}
