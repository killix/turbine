'use strict'

import Immutable from 'immutable'
import State from './State'
import queryString from 'query-string'

export default class Store {
  constructor(config, initialState) {
    this._config = config

    if (!initialState) {
      const state = {}
      Object.keys(config.models).forEach(type => {
        state[type] = new Immutable.Map()
        state[type + 'State'] = new Immutable.Map()
        state[type + 'List'] = new Immutable.Map()
        state[type + 'ListState'] = new Immutable.Map()
      })
      initialState = new Immutable.Map(state)
    }

    const reviver = (key, value) => {
      if (this._config.models[key]) {
        const Model = this._config.models[key]
        return new Model(value)
      }
    }

    this._state = new State(initialState, reviver)
  }

  /**
   * Get one record from the store.
   *
   * If the record is not in the store, will try to fetch it asynchronously.
   *
   * @param  {String} type     model type name
   * @param  {Object} options  find options
   * @return {Record}          record
   */
  getItem(type, options={}) {
    if (typeof options === 'string') {
      options = {id: options}
    }
    const item = this._items(type)([options.id])
    if (!item) {
      const itemState = this._itemStates(type)([options.id])
      if (itemState && itemState.error) {
        return itemState.error
      } else {
        this.loadItem(type, options)
      }
    }
    return item
  }

  /**
   * Fetch record.
   *
   * @param {String} type     model type name
   * @param {Object} options  find options
   */
  loadItem(type, options) {
    if (this._itemStates(type)([options.id]) === 'loading') { return }

    this._itemStates(type)(states => states.set(options.id, 'loading'))
    const Model = this._config.models[type]
    Model.find(options).then(
      this.loadItemSuccess.bind(this, type, options),
      this.loadItemFail.bind(this, type, options)
    )
  }

  /**
   * Record fetched successfully. Store it and update status.
   *
   * @param  {String} type    model type
   */
  loadItemSuccess(type, options, value) {
    this._itemStates(type)(states => states.set(options.id, 'loaded'))
    this._items(type)(items => items.set(options.id, value))
  }

  /**
   * Fetching item failed. Store the error status.
   *
   * @param  {String} type    model type name
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  loadItemFail(type, options, error) {
    this._itemStates(type)(states => states.set(options.id, {error: error}))
  }

  /**
   * Get list of records from the store.
   *
   * If the list has not been fetched yet, an asynchronous fetch will be triggered.
   *
   * @param  {Object} options  options by which to identify the list
   * @return {List}            list of records
   */
  getList(type, options={}) {
    const listKey = queryString.stringify(options)
    const list = this._lists(type)([listKey])

    if (!list) {
      const listState = this._listStates(type)([listKey])
      if (listState && listState.error) {
        // there was an error during fetch
        return listState.error
      } else {
        // not fetched yet
        this.loadList(type, options)
      }
    } else {
      // map ids to items
      return new Immutable.List(list.map(itemKey => this._items(type)([itemKey])))
    }
  }

  /**
   * Fetch list of records.
   *
   * @param {Object} options [description]
   */
  loadList(type, options={}) {
    const statesCursor = this._listStates(type)
    const listKey = queryString.stringify(options)
    if (statesCursor([listKey]) === 'loading') { return }

    statesCursor(states => states.set(listKey, 'loading'))
    const Model = this._config.models[type]
    Model.query(options).then(
      this.loadListSuccess.bind(this, type, options),
      this.loadListFail.bind(this, type, options)
    )
  }

  loadListSuccess(type, options, values) {
    const listStatesCursor = this._listStates(type)
    const listsCursor = this._lists(type)
    const itemsCursor = this._items(type)
    const itemStatesCursor = this._itemStates(type)
    const listKey = queryString.stringify(options)

    const list = values.map(item => {
      // TODO batch all item updates together
      // to avoid creating intermediary immutables
      const itemKey = item.id
      itemsCursor(items => items.set(itemKey, item))
      itemStatesCursor(states => states.set(itemKey, 'loaded'))
      return itemKey
    })
    listsCursor(lists => lists.set(listKey, list))
    listStatesCursor(states => states.set(listKey, 'loaded'))
  }

  loadListFail(type, options, error) {
    const listKey = queryString.stringify(options)
    this._listStates(type)(states => states.set(listKey, {error: error}))
  }

  _items(type) {
    return this._state.cursor([type])
  }

  _itemStates(type) {
    return this._state.cursor([type + 'State'])
  }

  _lists(type) {
    return this._state.cursor([type + 'List'])
  }

  _listStates(type) {
    return this._state.cursor([type + 'ListState'])
  }
}
