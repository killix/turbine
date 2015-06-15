'use strict'

import React from 'react/addons'
import Container from '../lib/Container'
import Store from '../lib/Store'
const TestUtils = React.addons.TestUtils

describe('Container', () => {
  it('wraps data fetching', () => {
    const MyComponent = React.createClass({
      render() {
        return null
      }
    })

    function MyModel() {}
    const store = new Store({
      models: {
        MyModel: MyModel
      }
    })

    spyOn(store, 'getList').and.returnValue([{id: 1, name: 'Joe'}, {id: 2, name: 'Jack'}])

    const MyContainer = Container(store)(MyComponent, {
      queries: {
        myModels: {
          model: MyModel,
          action: 'query',
          params: {
            sort: 'sort'
          }
        }
      }
    })

    TestUtils.renderIntoDocument(React.createElement(MyContainer, {sort: 'id'}))

    expect(store.getList).toHaveBeenCalledWith('MyModel', {sort: 'id'})
  })
})
