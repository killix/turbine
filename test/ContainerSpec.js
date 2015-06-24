'use strict'

var React = require('react/addons')
var graphql = require('graphql-parser').default
var Container = require('../lib/Container')
var Store = require('../lib/Store')
var Rotor = require('../lib/Rotor')
var TestUtils = React.addons.TestUtils

describe('Container', () => {
  let MyComponent, store

  beforeEach(() => {
    MyComponent = React.createClass({
      render() {
        return null
      }
    })

    function MyModel() {}
    store = new Store({
      models: {
        MyModel: MyModel
      }
    })

    Rotor._store = store
  })

  it('wraps data fetching', () => {
    spyOn(store, 'getList').and.returnValue([{id: 1, name: 'Joe'}, {id: 2, name: 'Jack'}])

    var MyContainer = Container(MyComponent, {
      queries: {
        myModels: graphql`
          {
            myModels(sort: <sort>) {
              id,
              name
            }
          }
        `
      }
    })

    TestUtils.renderIntoDocument(React.createElement(MyContainer, {sort: 'id'}))

    expect(store.getList).toHaveBeenCalledWith('MyModel', {sort: 'id'})
  })

  it('passes context', () => {
    var router = () => {}

    var Context = React.createClass({
      childContextTypes: {
        router: React.PropTypes.func
      },
      getChildContext: () => ({
        router: router
      }),
      render() {
        return this.props.children
      }
    })

    MyComponent = React.createClass({
      contextTypes: {
        router: React.PropTypes.func
      },
      render() {
        return null
      }
    })

    var MyContainer = Container(MyComponent)

    var rendered = TestUtils.renderIntoDocument(React.withContext({router: router}, () => {
      return React.createElement(Context, {}, React.createElement(MyContainer, {}))
    }))

    expect(TestUtils.findRenderedComponentWithType(rendered, MyComponent).context.router).toBe(router)
  })
})
