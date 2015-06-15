'use strict'

var Container = require('./lib/Container')
var Store = require('./lib/Store')

/**
 * var models = {
 *   Asset: Asset
 * }
 *
 * var Data = new Turbine({models: models})
 *
 * Data.container(Component, {
 *   queries: {
 *     assets: `
 *       Asset {
 *         url
 *       }
 *     `
 *   }
 * })
 */
module.exports = function(config, initialState) {
  var store = new Store(config, initialState)

  return {
    container: new Container(store)
  }
}
