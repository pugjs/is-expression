'use strict';

var fs = require('fs');
var assert = require('assert');
var testit = require('testit');
var isExpression = require('../');

testit('api', function () {
  testit('no options', function () {
    assert(isExpression('myVar'))
    assert(!isExpression('var'))
    assert(isExpression('["an", "array", "\'s"].indexOf("index")'))
  })

  testit('throw === true', function () {
    var options = {throw: true}
    assert.throws(function () {
      isExpression('var', options)
    })
  })

  testit('strict === true', function () {
    var options = {strict: true}
    assert(isExpression('public'))
    assert(!isExpression('public', options))
  })
})

function passes (src, options) {
  testit(JSON.stringify(src, options), function () {
    options = options || {}
    assert(isExpression(src, options))
  })
}

testit('passes', function () {
  passes('myVar')
  passes('["an", "array", "\'s"].indexOf("index")')
  passes('\npublic')
  passes('abc // my comment', {lineComment: true})
  passes('() => a', {ecmaVersion: 6})
})

function error (src, line, col, options) {
  testit(JSON.stringify(src), function () {
    options = options || {}
    assert(!isExpression(src, options))
    options.throw = true 
    assert.throws(function () {
      isExpression(src, options)
    }, function (err) {
      assert.equal(err.loc.line, line)
      assert.equal(err.loc.column, col)
      assert(err.message)
      return true
    })
  })
}

testit('fails', function () {
  error('', 1, 0)
  error('var', 1, 0)
  error('weird error', 1, 6)
  error('asdf}', 1, 4)
  error('\npublic', 2, 0, {strict: true})
  error('abc // my comment', 1, 4)
  error('() => a', 1, 1)
})
