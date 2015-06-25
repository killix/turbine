'use strict'

var React = require('react/addons')
var graphql = require('../lib/graphql')
var Container = require('../lib/Container')
var Store = require('../lib/Store')
var Rotor = require('../lib/Rotor')
var TestUtils = React.addons.TestUtils

describe('Container', () => {
  let MyComponent, store

  var createContainer = function(component) {
    return Container(component, {
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
  }

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

    var MyContainer = createContainer(MyComponent)
    TestUtils.renderIntoDocument(React.createElement(MyContainer, {sort: 'id'}))

    expect(store.getList).toHaveBeenCalledWith('MyModel', {sort: 'id'})
  })

  it('fetches new data when props change', () => {
    spyOn(store, 'getList')

    var MyContainer = createContainer(MyComponent)
    var Wrapper = React.createClass({
      getInitialState: function() {
        return { sort: 'id' }
      },
      render() {
        return React.createElement(MyContainer, {sort: this.state.sort})
      }
    })

    var wrapper = TestUtils.renderIntoDocument(React.createElement(Wrapper, {}))
    expect(store.getList).toHaveBeenCalledWith('MyModel', {sort: 'id'})

    wrapper.setState({sort: 'time'})
    expect(store.getList).toHaveBeenCalledWith('MyModel', {sort: 'time'})
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
