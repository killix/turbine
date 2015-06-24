'use strict'

import graphql from 'graphql-parser'
import Container from './lib/Container'
import Store from './lib/Store'
import Rotor from './lib/Rotor'

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

  init: (config, initialState) => {
    Rotor._store = new Store(config, initialState)
  },

  container: Container
}
