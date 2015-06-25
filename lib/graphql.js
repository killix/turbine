'use strict'

var graphqlParser = require('graphql-parser').default

// workaround for https://github.com/ooflorent/graphql-parser/issues/5
// defers query compilation until when executed with params
module.exports = function graphql(string, ...values) {
  return {
    compile: function() {
      return graphqlParser(string, values)
    }
  }
}
